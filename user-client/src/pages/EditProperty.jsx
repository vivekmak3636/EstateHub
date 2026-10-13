import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import propertyService from "../services/propertyService";

import "./EditProperty.css";

const initialForm = {
  title: "",
  description: "",
  price: "",
  propertyType: "apartment",
  purpose: "sale",
  address: "",
  city: "",
  state: "",
  pincode: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  floor: "",
  totalFloors: "",
  balcony: "",
  yearBuilt: "",
  amenities: "",
  images: "",
};

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================
     LOAD EXISTING PROPERTY
     Use my-properties so pending properties
     can also be edited by their owner.
  ========================================= */

  useEffect(() => {
    let isMounted = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await propertyService.getMyProperties();

        const properties = Array.isArray(response)
          ? response
          : response?.properties || [];

        const property = properties.find(
          (item) => String(item._id) === String(id)
        );

        if (!property) {
          if (isMounted) {
            setError(
              "Property not found in your listings, or you do not have permission to edit it."
            );
          }
          return;
        }

        if (isMounted) {
          setFormData({
            title: property.title || "",
            description: property.description || "",
            price: property.price ?? "",
            propertyType: (
              property.propertyType || "apartment"
            ).toLowerCase(),
            purpose: (
              property.purpose || "sale"
            ).toLowerCase(),

            address: property.location?.address || "",
            city: property.location?.city || "",
            state: property.location?.state || "",
            pincode: property.location?.pincode || "",

            bedrooms: property.bedrooms ?? "",
            bathrooms: property.bathrooms ?? "",
            area: property.area ?? "",
            floor: property.floor ?? "",
            totalFloors: property.totalFloors ?? "",
            balcony: property.balcony ?? "",
            yearBuilt: property.yearBuilt ?? "",

            amenities: Array.isArray(property.amenities)
              ? property.amenities.join(", ")
              : "",

            images: Array.isArray(property.images)
              ? property.images.join("\n")
              : "",
          });
        }
      } catch (err) {
        console.error("Load property error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load property details. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadProperty();
    } else {
      setError("Property ID is missing.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  /* =========================================
     INPUT CHANGE
  ========================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
     UPDATE PROPERTY
  ========================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const price = Number(formData.price);
    const area = Number(formData.area);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid property price.");
      return;
    }

    if (
      formData.area !== "" &&
      (!Number.isFinite(area) || area <= 0)
    ) {
      setError("Please enter a valid property area.");
      return;
    }

    const images = formData.images
      .split("\n")
      .map((image) => image.trim())
      .filter(Boolean);

    const amenities = formData.amenities
      .split(",")
      .map((amenity) => amenity.trim())
      .filter(Boolean);

    const optionalNumber = (value) =>
      value === "" ? undefined : Number(value);

    const propertyData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      price,
      propertyType: formData.propertyType,
      purpose: formData.purpose,

      location: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      },

      bedrooms: optionalNumber(formData.bedrooms),
      bathrooms: optionalNumber(formData.bathrooms),
      area: optionalNumber(formData.area),
      floor: optionalNumber(formData.floor),
      totalFloors: optionalNumber(formData.totalFloors),
      balcony: optionalNumber(formData.balcony),
      yearBuilt: optionalNumber(formData.yearBuilt),

      amenities,
      images,
    };

    // Remove optional fields left empty.
    Object.keys(propertyData).forEach((key) => {
      if (propertyData[key] === undefined) {
        delete propertyData[key];
      }
    });

    try {
      setSaving(true);

      await propertyService.updateProperty(id, propertyData);

      setSuccess(
        "Property updated successfully and submitted for admin approval."
      );

      // Give the success message a moment to display.
      window.setTimeout(() => {
        navigate("/my-properties", {
          state: {
            message:
              "Property updated and submitted for approval.",
          },
        });
      }, 900);
    } catch (err) {
      console.error("Update property error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update property. Please check your details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     LOADING / ERROR
  ========================================= */

  if (loading) {
    return (
      <main className="edit-property-page">
        <div className="edit-property-container">
          <div className="edit-property-state">
            <span className="edit-property-spinner"></span>
            <p>Loading your property details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !formData.title) {
    return (
      <main className="edit-property-page">
        <div className="edit-property-container">
          <div className="edit-property-state edit-property-state-error">
            <h2>Unable to open property</h2>
            <p>{error}</p>

            <button
              type="button"
              className="edit-secondary-button"
              onClick={() => navigate("/my-properties")}
            >
              Back to My Properties
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =========================================
     FORM
  ========================================= */

  return (
    <main className="edit-property-page">
      <div className="edit-property-container">

        <div className="edit-property-heading">
          <button
            type="button"
            className="edit-back-link"
            onClick={() => navigate("/my-properties")}
          >
            <span aria-hidden="true">←</span>
            My Properties
          </button>

          <span className="edit-property-eyebrow">
            ESTATEHUB OWNER PANEL
          </span>

          <h1>Edit Property</h1>

          <p>
            Update your property information and resubmit
            it for admin approval.
          </p>
        </div>

        <div className="edit-property-notice">
          <span className="edit-notice-icon">i</span>

          <div>
            <strong>Approval notice</strong>
            <p>
              After you save your changes, the property will
              return to pending status until an admin reviews it.
            </p>
          </div>
        </div>

        {error && (
          <div className="edit-form-alert edit-form-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="edit-form-alert edit-form-alert-success">
            {success}
          </div>
        )}

        <form
          className="edit-property-form"
          onSubmit={handleSubmit}
        >

          {/* BASIC DETAILS */}

          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span className="edit-section-number">01</span>

              <div>
                <h2>Basic Information</h2>
                <p>Tell buyers about your property.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field edit-field-full">
                <label htmlFor="title">
                  Property Title <span>*</span>
                </label>

                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. 3 BHK Luxury Apartment"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="propertyType">
                  Property Type <span>*</span>
                </label>

                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="plot">Plot</option>
                  <option value="office">Office</option>
                  <option value="shop">Shop</option>
                  <option value="warehouse">Warehouse</option>
                </select>
              </div>

              <div className="edit-field">
                <label htmlFor="purpose">
                  Listing Purpose <span>*</span>
                </label>

                <select
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                >
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div className="edit-field edit-field-full">
                <label htmlFor="description">
                  Property Description <span>*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the property, its features and surroundings..."
                  rows="5"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="price">
                  Price (₹) <span>*</span>
                </label>

                <input
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="6500000"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="area">
                  Area (sq. ft.) <span>*</span>
                </label>

                <input
                  id="area"
                  name="area"
                  type="number"
                  min="1"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="1800"
                  required
                />
              </div>
            </div>
          </section>

          {/* LOCATION */}

          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span className="edit-section-number">02</span>

              <div>
                <h2>Property Location</h2>
                <p>Keep the address accurate and up to date.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field edit-field-full">
                <label htmlFor="address">
                  Street / Full Address <span>*</span>
                </label>

                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Main Road, Near Landmark"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="city">
                  City <span>*</span>
                </label>

                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Bhavnagar"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="state">
                  State <span>*</span>
                </label>

                <input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Gujarat"
                  required
                />
              </div>

              <div className="edit-field">
                <label htmlFor="pincode">PIN Code</label>

                <input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="364001"
                />
              </div>
            </div>
          </section>

          {/* PROPERTY DETAILS */}

          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span className="edit-section-number">03</span>

              <div>
                <h2>Property Details</h2>
                <p>Update the size and interior information.</p>
              </div>
            </div>

            <div className="edit-form-grid">
              <div className="edit-field">
                <label htmlFor="bedrooms">Bedrooms</label>

                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  placeholder="3"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="bathrooms">Bathrooms</label>

                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  placeholder="2"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="floor">Floor Number</label>

                <input
                  id="floor"
                  name="floor"
                  type="number"
                  min="0"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="totalFloors">Total Floors</label>

                <input
                  id="totalFloors"
                  name="totalFloors"
                  type="number"
                  min="0"
                  value={formData.totalFloors}
                  onChange={handleChange}
                  placeholder="10"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="balcony">Balconies</label>

                <input
                  id="balcony"
                  name="balcony"
                  type="number"
                  min="0"
                  value={formData.balcony}
                  onChange={handleChange}
                  placeholder="2"
                />
              </div>

              <div className="edit-field">
                <label htmlFor="yearBuilt">Year Built</label>

                <input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="number"
                  min="1800"
                  max="2100"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  placeholder="2024"
                />
              </div>

              <div className="edit-field edit-field-full">
                <label htmlFor="amenities">
                  Amenities
                </label>

                <input
                  id="amenities"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleChange}
                  placeholder="Parking, Swimming Pool, Gym, Security"
                />

                <small>
                  Separate each amenity with a comma.
                </small>
              </div>
            </div>
          </section>

          {/* IMAGES */}

          <section className="edit-form-section">
            <div className="edit-section-heading">
              <span className="edit-section-number">04</span>

              <div>
                <h2>Property Images</h2>
                <p>Update your image URLs.</p>
              </div>
            </div>

            <div className="edit-field">
              <label htmlFor="images">
                Image URLs
              </label>

              <textarea
                id="images"
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder={
                  "https://example.com/property-image-1.jpg\nhttps://example.com/property-image-2.jpg"
                }
                rows="5"
              />

              <small>
                Enter one direct image URL per line.
                Saving this field replaces the existing image list.
              </small>
            </div>
          </section>

          {/* ACTIONS */}

          <div className="edit-form-actions">
            <button
              type="button"
              className="edit-secondary-button"
              onClick={() => navigate("/my-properties")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="edit-submit-button"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save & Submit for Approval"}

              {!saving && (
                <span aria-hidden="true">→</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
};

export default EditProperty;