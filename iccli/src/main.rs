use anyhow::Result;
use img_processor::{DefaultImageProcessorFactory, ImageProcessorFactory, Quality};
use std::path::Path;
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

fn main() {
    let factory = DefaultImageProcessorFactory {};
    let input_path = "test.jpg";
    let output_dir = Path::new("/tmp");
    let quality = Quality::try_from(50).unwrap();
    if let Err(e) = process_image(&factory, input_path, output_dir, quality) {
        eprintln!("Error processing image: {}", e);
    }
    if let Err(e) = process_image(
        &factory,
        "https://raw.githubusercontent.com/ianare/exif-samples/refs/heads/master/jpg/Fujifilm_FinePix6900ZOOM.jpg",
        output_dir,
        quality,
    ) {
        eprintln!("Error processing image: {}", e);
    }
}
