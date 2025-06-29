use img_processor::{DefaultImageProcessorFactory, ImageProcessorFactory, Quality};
use std::path::Path;
use anyhow::Result;

fn process_image(
    factory: &impl ImageProcessorFactory,
    input_path: &str,
    output_dir: &str,
    quality: Quality,
) -> Result<()> {
    // TODO: download image from URL if needed
    let input_path = Path::new(input_path);
    let name = input_path
        .file_name()
        .ok_or_else(|| anyhow::anyhow!("Invalid input path"))?;
    let output_path = Path::new(output_dir).join(name);
    let processor = factory.process_image(input_path)?;
    processor.shrink_to(&output_path, quality)?;
    println!("Image processed and saved to: {}", output_path.display());
    Ok(())
}

fn main() {
    let factory = DefaultImageProcessorFactory {};
    let input_path = "test.jpg";
    let output_dir = "/tmp";
    let quality = Quality::try_from(50).unwrap();
    if let Err(e) = process_image(&factory, input_path, output_dir, quality) {
        eprintln!("Error processing image: {}", e);
    }
}
