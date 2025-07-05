use anyhow::Result;
use clap::Parser;
use config::Config;
use futures::future::join_all;
use img_processor::{DefaultImageProcessorFactory, ImageProcessorFactory, Quality};
use std::{io::BufRead, path::Path, sync::Arc};
use tempfile::Builder;
use tokio::sync::Mutex;
use tracing::{Level, event, instrument};
use tracing_subscriber::{
    EnvFilter,
    fmt::{self, format::FmtSpan},
    prelude::*,
};

#[instrument(skip(factory))]
fn shrink_image(
    factory: &impl ImageProcessorFactory,
    input_path: &Path,
    output_dir: &Path,
    quality: Quality,
) -> Result<()> {
    let name = input_path
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("Invalid input path"))?;
    let output_path = Path::new(output_dir).join(name);
    let processor = factory.process_image(input_path)?;
    processor.shrink_to(&output_path, quality)?;
    event!(
        Level::INFO,
        "Image processed and saved to: {}",
        output_path.display()
    );
    Ok(())
}

#[instrument(skip(factory, output_dir))]
async fn process_image<F: ImageProcessorFactory + Send + 'static>(
    factory: Arc<Mutex<F>>,
    input_path: &str,
    output_dir: &Path,
    quality: Quality,
) -> Result<()> {
    if input_path.starts_with("http://") || input_path.starts_with("https://") {
        // Handle remote image processing
        let response = reqwest::get(input_path).await?;
        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "Failed to fetch image from URL: {}",
                input_path
            ));
        }
        let bytes = response.bytes().await?;
        let mut temp_file = Builder::new()
            .prefix("img_compactor_")
            .suffix(".jpg")
            .tempfile()?;
        temp_file.disable_cleanup(true);
        let temp_path = temp_file.path().to_owned();
        event!(
            Level::INFO,
            "Temporary file created at: {}",
            temp_path.display()
        );
        tokio::fs::write(&temp_path, bytes).await?;
        let output_dir = output_dir.to_owned();
        tokio::task::spawn_blocking(move || {
            let factory = factory.blocking_lock();
            shrink_image(&*factory, &temp_path, &output_dir, quality)
        })
        .await?
    } else {
        // Handle local image processing
        let input_path = Path::new(input_path).to_owned();
        let output_dir = output_dir.to_owned();
        tokio::task::spawn_blocking(move || {
            let factory = factory.blocking_lock();
            shrink_image(&*factory, &input_path, &output_dir, quality)
        })
        .await?
    }
}

async fn process_files<F, I>(
    factory: Arc<Mutex<F>>,
    input_files: I,
    output_dir: &Path,
    quality: Quality,
) where
    F: ImageProcessorFactory + Send + 'static,
    I: Iterator<Item = String> + Send + 'static,
{
    let tasks = input_files
        .map(|input| {
            let factory = factory.clone();
            let output_dir = output_dir.to_owned();
            tokio::spawn(async move {
                if let Err(e) = process_image(factory, &input, &output_dir, quality).await {
                    eprintln!("Error processing image {}: {}", input, e);
                }
            })
        })
        .collect::<Vec<_>>();

    join_all(tasks).await;
}

/// Command-line interface for the image compactor
#[derive(clap::Parser)]
#[command(version, about)]
struct Cli {
    /// File path to read input paths from
    #[arg(long, value_name = "FILE")]
    from_file: Option<String>,
    /// The input image file paths or URLs (JPEG)
    input: Vec<String>,
    /// Reading EOL separated list of files from stdin, finish with Ctrl+D
    #[arg(long)]
    stdin: bool,
    /// Output directory for processed images
    #[arg(long, value_name = "DIR")]
    output_dir: Option<String>,
    /// Quality of the output images (0-100)
    #[arg(long, value_name = "QUALITY")]
    quality: Option<u64>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing subscriber for logging
    tracing_subscriber::registry()
        .with(
            fmt::layer()
                .with_target(false)
                .with_span_events(FmtSpan::CLOSE),
        )
        .with(EnvFilter::from_default_env())
        .init();

    let cli = Cli::parse();
    let config = Config::builder()
        .add_source(config::Environment::with_prefix("ICCLI"))
        .add_source(config::File::with_name("config.toml").required(false))
        .build()?;

    let factory = Arc::new(Mutex::new(DefaultImageProcessorFactory {}));
    let output_dir = cli.output_dir.unwrap_or_else(|| {
        config
            .get_string("output_dir")
            .unwrap_or_else(|_| "/tmp".to_string())
    });
    event!(Level::INFO, "Output directory: {}", output_dir);
    let output_dir = Path::new(&output_dir);
    const DEFAULT_QUALITY: u64 = 50;
    let quality = cli.quality.unwrap_or_else(|| {
        config
            .get_int("quality")
            .unwrap_or_else(|_| DEFAULT_QUALITY as i64)
            .try_into()
            .unwrap_or(DEFAULT_QUALITY)
    });
    event!(Level::INFO, "Image quality: {}", quality);
    let quality = Quality::try_from(quality)?;
    process_files(factory.clone(), cli.input.into_iter(), output_dir, quality).await;
    /*if cli.stdin {
        event!(
            Level::WARN,
            "Reading list of files from stdin. Press Ctrl+D to finish input."
        );
        let stdin = std::io::stdin().lock();
        process_files(
            factory.clone(),
            stdin.lines().filter_map(Result::ok),
            output_dir,
            quality,
        )
        .await;
    }*/
    if let Some(path) = cli.from_file {
        let input_file = std::fs::File::open(path)?;
        let reader = std::io::BufReader::new(input_file);
        process_files(
            factory,
            reader.lines().filter_map(Result::ok),
            output_dir,
            quality,
        )
        .await;
    }
    Ok(())
}
