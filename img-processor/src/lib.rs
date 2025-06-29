#![allow(unused)]

use image::{
    ImageDecoder,
    codecs::jpeg::{JpegDecoder, JpegEncoder},
};
use std::{
    fs::File,
    io::BufReader,
    path::{Path, PathBuf},
};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ImageProcessorError {
    #[error("Unsupported image format")]
    UnsupportedFormat,
    #[error("Quality value out of range")]
    QualityOutOfRange,
    #[error("Image I/O error")]
    IoError(#[from] std::io::Error),
    #[error("Image decoding error")]
    DecodingError(String),
}

type Result<T> = std::result::Result<T, ImageProcessorError>;

/// Trait for image processing factories that can create image processors
pub trait ImageProcessorFactory {
    /// Starts processing an image at the given path
    fn process_image(&self, image: &Path) -> Result<Box<dyn ImageProcessor>>;
}

/// Represents the quality of the image compression, ranging from 0 to 100
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Quality(u8);

impl TryFrom<u8> for Quality {
    type Error = ImageProcessorError;

    fn try_from(value: u8) -> Result<Self> {
        if value > 100 {
            Err(ImageProcessorError::QualityOutOfRange)
        } else {
            Ok(Quality(value))
        }
    }
}

/// Default implementation of the ImageProcessorFactory
pub struct DefaultImageProcessorFactory {}

impl ImageProcessorFactory for DefaultImageProcessorFactory {
    fn process_image(&self, image: &Path) -> Result<Box<dyn ImageProcessor>> {
        if let Some(extension) = image.extension().and_then(|s| s.to_str())
            && (extension == "jpg" || extension == "jpeg")
        {
            Ok(Box::new(JpegProcessor {
                input_path: image.to_path_buf(),
            }))
        } else {
            Err(ImageProcessorError::UnsupportedFormat)
        }
    }
}

/// Trait for image processors
pub trait ImageProcessor {
    /// Shrink the image to the specified output path with the given quality
    fn shrink_to(&self, output_path: &Path, quality: Quality) -> Result<()>;
}

struct JpegProcessor {
    input_path: PathBuf,
}

impl ImageProcessor for JpegProcessor {
    fn shrink_to(&self, output_path: &Path, quality: Quality) -> Result<()> {
        let file_stream =
            BufReader::new(File::open(&self.input_path).map_err(ImageProcessorError::IoError)?);
        let decoder = JpegDecoder::new(file_stream).map_err(|e| {
            ImageProcessorError::DecodingError(format!("Failed to start decoding JPEG: {}", e))
        })?;
        let mut buffer = vec![0; decoder.total_bytes() as usize];
        let (width, height) = decoder.dimensions();
        let color_type = decoder.original_color_type();
        decoder.read_image(&mut buffer).map_err(|e| {
            ImageProcessorError::DecodingError(format!("Failed to parse JPEG image: {}", e))
        })?;
        let mut encoder = JpegEncoder::new_with_quality(
            File::create(output_path).map_err(ImageProcessorError::IoError)?,
            quality.0,
        );
        encoder
            .encode(&buffer, width, height, color_type)
            .map_err(|e| {
                ImageProcessorError::DecodingError(format!("Failed to encode JPEG image: {}", e))
            })?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use std::fs;

    use super::*;

    #[test]
    fn test_quality() {
        let quality = Quality::try_from(50);
        assert!(quality.is_ok());
        assert_eq!(quality.unwrap().0, 50);

        let quality = Quality::try_from(150);
        assert!(quality.is_err());
    }

    #[test]
    fn test_image_processor_factory() {
        let factory = DefaultImageProcessorFactory {};
        let processor = factory.process_image(Path::new("test.jpg"));
        assert!(processor.is_ok());
        let processor = factory.process_image(Path::new("test.jpeg"));
        assert!(processor.is_ok());
        let processor = factory.process_image(Path::new("test.png"));
        assert!(processor.is_err());
    }

    #[test]
    fn test_jpeg_processor() {
        let input_path = Path::new("test.jpg");
        let processor = JpegProcessor {
            input_path: input_path.to_path_buf(),
        };
        let output_path = Path::new("/tmp/img-compactor-test-output.jpg");
        fs::remove_file(&output_path).ok();
        let quality = Quality::try_from(50).unwrap();
        let result = processor.shrink_to(output_path, quality);
        assert!(result.is_ok());
        assert!(output_path.exists());
        assert!(
            fs::metadata(&output_path).unwrap().len() < fs::metadata(&input_path).unwrap().len()
        );
    }

    #[test]
    fn test_jpeg_processor_errors() {
        let input_path = Path::new("non_existent.jpg");
        let quality = Quality::try_from(50).unwrap();
        let output_path = Path::new("/tmp/img-compactor-test-output.jpg");

        // Test non-existent input file
        let processor = JpegProcessor {
            input_path: input_path.to_path_buf(),
        };
        let result = processor.shrink_to(output_path, quality);
        assert!(result.is_err());

        // Test unsupported format
        let unsupported_path = Path::new("Cargo.toml");
        let processor = JpegProcessor {
            input_path: unsupported_path.to_path_buf(),
        };
        let result = processor.shrink_to(output_path, quality);
        assert!(result.is_err());

        // Test wrong output path
        let wrong_output_path = Path::new("/non_writable_dir/output.jpg");
        let processor = JpegProcessor {
            input_path: input_path.to_path_buf(),
        };
        let result = processor.shrink_to(wrong_output_path, quality);
        assert!(result.is_err());
    }
}
