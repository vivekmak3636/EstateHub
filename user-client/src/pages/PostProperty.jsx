
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import propertyService from "../services/propertyService";
import "./PostProperty.css";

const initialFormData = {
  title: "",
  description: "",
  price: "",
  type: "apartment",
  purpose: "sale",
  address: "",
  city: "",
  state: "",
  pincode: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  images: "",
};

const PostProperty = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        propertyType: formData.type,
        purpose: formData.purpose,
        location: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        area: Number(formData.area) || 0,
        images: formData.images
          .split(",")
          .map((image) => image.trim())
          .filter(Boolean),
      };

      const response = await propertyService.createProperty(propertyData);

      setSuccess(
        response?.message ||
          "Property submitted successfully for admin approval."
      );
      setFormData({ ...initialFormData });
    } catch (err) {
      console.error("Create property error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to submit property. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="post-property-page">
      <section className="post-property-header">
        <div className="container">
          <span className="section-label">ESTATEHUB</span>
          <h1>List Your Property</h1>
          <p>
            Add your property details and reach potential buyers
            and tenants.
          </p>
        </div>
      </section>

      <section className="post-property-section">
        <div className="container">
          <div className="post-property-layout">
            <div className="post-property-card">
              <div className="form-header">
                <span className="form-step">01</span>
                <div>
                  <h2>Property Information</h2>
                  <p>Enter the basic details of your property.</p>
                </div>
              </div>

              {error && (
                <div className="form-alert form-alert-error" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="form-alert form-alert-success"
                  role="status"
                >
                  {success}
                  <div className="success-actions">
                    <button
                      type="button"
                      className="success-link"
                      onClick={() => navigate("/my-properties")}
                    >
                      View My Properties
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title">
                    Property Title <span>*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Premium 3 BHK Apartment"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Description <span>*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your property..."
                    rows={5}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">
                      Price (₹) <span>*</span>
                    </label>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="6500000"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="purpose">
                      Purpose <span>*</span>
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="type">
                      Property Type <span>*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="apartment">Apartment</option>
                      <option value="villa">Villa</option>
                      <option value="house">House</option>
                      <option value="plot">Plot</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div className="form-group">
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
                </div>

                <div className="details-heading">
                  <span className="form-step">02</span>
                  <div>
                    <h2>Location Details</h2>
                    <p>Enter the complete property address.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">
                    Full Address <span>*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number, street, area"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
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

                  <div className="form-group">
                    <label htmlFor="pincode">
                      Pincode <span>*</span>
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      title="Enter a valid 6-digit pincode"
                      required
                    />
                  </div>
                </div>

                <div className="details-heading">
                  <span className="form-step">03</span>
                  <div>
                    <h2>Property Details</h2>
                    <p>Add additional property information.</p>
                  </div>
                </div>

                <div className="form-row three-columns">
                  <div className="form-group">
                    <label htmlFor="bedrooms">Bedrooms</label>
                    <input
                      id="bedrooms"
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      placeholder="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bathrooms">Bathrooms</label>
                    <input
                      id="bathrooms"
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      placeholder="2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="area">Area (sq. ft.)</label>
                    <input
                      id="area"
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      min="0"
                      placeholder="1850"
                    />
                  </div>
                </div>

                <div className="details-heading image-heading">
                  <span className="form-step">04</span>
                  <div>
                    <h2>Property Images</h2>
                    <p>Add image URLs separated by commas.</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="images">Image URLs</label>
                  <textarea
                    id="images"
                    name="images"
                    value={formData.images}
                    onChange={handleChange}
                    placeholder="https://example.com/house.jpg"
                    rows={4}
                  />
                  <small className="form-help">
                    Separate multiple image URLs with commas.
                  </small>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate("/properties")}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Property"}
                  </button>
                </div>
              </form>
            </div>

            <aside className="post-property-sidebar">
              <div className="info-card">
                <div className="info-icon">✓</div>
                <h3>Admin Approval</h3>
                <p>
                  Your property will be reviewed by the admin
                  before it becomes visible to users.
                </p>
              </div>

              <div className="info-card">
                <div className="info-icon">◆</div>
                <h3>Better Property Listing</h3>
                <p>
                  Add accurate details and quality images to
                  attract interested buyers.
                </p>
              </div>

              <div className="info-card dark">
                <span className="sidebar-label">ESTATEHUB</span>
                <h3>Find the right buyer for your property.</h3>
                <p>
                  List your property with clear details and
                  reach the right audience.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default PostProperty;
