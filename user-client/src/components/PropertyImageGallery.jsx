
import { useState, useEffect } from "react";
import "./PropertyImageGallery.css";

const getImageUrl = (image) => {
  if (typeof image === "string") return image;

  if (image && typeof image === "object") {
    return (
      image.url ||
      image.secure_url ||
      image.imageUrl ||
      image.src ||
      ""
    );
  }

  return "";
};

const PropertyImageGallery = ({ property, images: imagesProp }) => {
  const propertyImages =
    imagesProp ??
    property?.images ??
    property?.imageUrls ??
    property?.photos ??
    property?.image ??
    [];

  const normalizedImages = (
    Array.isArray(propertyImages) ? propertyImages : [propertyImages]
  )
    .map(getImageUrl)
    .filter(Boolean);

  const images = [...new Set(normalizedImages)];
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState([]);

  useEffect(() => {
    setActiveIndex(0);
    setFailedImages([]);
  }, [property?._id, property?.id, imagesProp]);

  useEffect(() => {
    if (activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, images.length]);

  const activeImage = images[activeIndex];
  const title = property?.title || property?.name || "Property";
  const mainImageFailed = activeImage
    ? failedImages.includes(activeImage)
    : true;

  const handleImageError = (imageUrl) => {
    setFailedImages((previous) =>
      previous.includes(imageUrl)
        ? previous
        : [...previous, imageUrl]
    );
  };

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="property-gallery" aria-label="Property images">
      <div className="property-gallery-heading">
        <div>
          <span className="property-gallery-eyebrow">
            ESTATEHUB COLLECTION
          </span>
          <h2>{title}</h2>
        </div>

        {images.length > 0 && (
          <span className="property-gallery-count">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      <div className="property-gallery-main">
        {activeImage && !mainImageFailed ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={`${title} - image ${activeIndex + 1}`}
            className="property-gallery-main-image"
            onError={() => handleImageError(activeImage)}
          />
        ) : (
          <div className="property-gallery-placeholder">
            <span aria-hidden="true">🏡</span>
            <h3>
              {images.length === 0
                ? "No property images available"
                : "Image could not be loaded"}
            </h3>
            <p>Property photos will appear here when available.</p>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="property-gallery-arrow property-gallery-prev"
              onClick={showPrevious}
              aria-label="Previous image"
            >
              &#10094;
            </button>

            <button
              type="button"
              className="property-gallery-arrow property-gallery-next"
              onClick={showNext}
              aria-label="Next image"
            >
              &#10095;
            </button>
          </>
        )}

        {images.length > 0 && (
          <div className="property-gallery-image-label">
            <span>PROPERTY GALLERY</span>
            <span>{images.length} Photos</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="property-gallery-thumbnails">
          {images.map((image, index) => (
            <button
              type="button"
              key={`${image}-${index}`}
              className={`property-gallery-thumbnail ${
                activeIndex === index ? "selected" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={activeIndex === index}
            >
              {failedImages.includes(image) ? (
                <span className="property-gallery-thumbnail-fallback">
                  🏡
                </span>
              ) : (
                <img
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  loading="lazy"
                  onError={() => handleImageError(image)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default PropertyImageGallery;
