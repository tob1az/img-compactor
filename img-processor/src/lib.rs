#![allow(unused)]

use std::path::Path;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ImageProcessorError {
    #[error("Unsupported image format")]
    UnsupportedFormat,
    #[error("Quality value out of range")]
    QualityOutOfRange,
}

type Result<T> = std::result::Result<T, ImageProcessorError>;
pub trait ImageProcessorFactory {
    fn process_image(&self, image: &Path) -> Result<Box<dyn ImageProcessor>>;
}

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

pub struct DefaultImageProcessorFactory {}

impl ImageProcessorFactory for DefaultImageProcessorFactory {
    fn process_image(&self, image: &Path) -> Result<Box<dyn ImageProcessor>> {
        if let Some(extension) = image.extension().and_then(|s| s.to_str())
            && (extension == "jpg" || extension == "jpeg")
        {
            Ok(Box::new(JpegProcessor {}))
        } else {
            Err(ImageProcessorError::UnsupportedFormat)
        }
    }
}

pub trait ImageProcessor {
    fn shrink_to(&self, output_path: &Path) -> Result<()>;
}

struct JpegProcessor {}

impl ImageProcessor for JpegProcessor {
    fn shrink_to(&self, _output_path: &Path) -> Result<()> {
        todo!("Implement JPEG processing logic here")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_quality() {
        let quality = Quality::try_from(50);
        assert!(quality.is_ok());
        assert_eq!(quality.unwrap().0, 50);

        let quality = Quality::try_from(150);
        assert!(quality.is_err());
    }
}
