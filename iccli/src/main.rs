use anyhow::Result;
use clap::Parser;
use img_processor::{DefaultImageProcessorFactory, ImageProcessorFactory, Quality};
use std::{io::BufRead, path::Path};
use tempfile::Builder;

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
    println!("Image processed and saved to: {}", output_path.display());
    Ok(())
}

fn process_image(
    factory: &impl ImageProcessorFactory,
    input_path: &str,
    output_dir: &Path,
    quality: Quality,
) -> Result<()> {
    if input_path.starts_with("http://") || input_path.starts_with("https://") {
        // Handle remote image processing
        let response = reqwest::blocking::get(input_path)?;
        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "Failed to fetch image from URL: {}",
                input_path
            ));
        }
        let bytes = response.bytes()?;
        let mut temp_file = Builder::new()
            .prefix("img_compactor_")
            .suffix(".jpg")
            .tempfile()?;
        temp_file.disable_cleanup(true);
        let temp_path = temp_file.path();
        println!("Temporary file created at: {}", temp_path.display());
        std::fs::write(temp_path, bytes)?;
        shrink_image(factory, temp_path, output_dir, quality)
    } else {
        // Handle local image processing
        let input_path = Path::new(input_path);
        shrink_image(factory, input_path, output_dir, quality)
    }
}

fn process_files<F: ImageProcessorFactory, I: Iterator<Item = String>>(
    factory: &F,
    input_files: I,
    output_dir: &Path,
    quality: Quality,
) {
    for input in input_files {
        if let Err(e) = process_image(factory, &input, output_dir, quality) {
            eprintln!("Error processing image {}: {}", input, e);
        }
    }
}

/// Command-line interface for the image compactor
#[derive(clap::Parser)]
#[command(version, about)]
struct Cli {
    /// The input image file paths or URLs (JPEG)
    input: Vec<String>,
    /// Reading EOL separated list of files from stdin, finish with Ctrl+D
    #[arg(long)]
    stdin: bool,

}

fn main() {
    let cli = Cli::parse();

    let factory = DefaultImageProcessorFactory {};
    let output_dir = Path::new("/tmp");
    let quality = Quality::try_from(50).unwrap();
    process_files(&factory, cli.input.into_iter(), output_dir, quality);
    if cli.stdin {
        println!("Reading list of files from stdin. Press Ctrl+D to finish input.");
        process_files(
            &factory,
            std::io::stdin().lock().lines().filter_map(Result::ok),
            output_dir,
            quality,
        );
    }
}
