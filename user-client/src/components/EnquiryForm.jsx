import { useState } from "react";
import enquiryService from "../services/enquiryService";
import "./EnquiryForm.css";

const EnquiryForm = ({ propertyId }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    type: "",
    message: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!propertyId) {
      setFeedback({
        type: "error",
        message: "Property ID missing. Please reopen the property.",
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: "", message: "" });

      const response = await enquiryService.createEnquiry({
        propertyId,
        ...formData,
      });

      setFeedback({
        type: "success",
        message:
          response?.message || "Your enquiry has been submitted successfully!",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Enquiry submission error:",
        error?.response?.data || error
      );

      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Unable to submit enquiry. Please log in and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enquiry-form">
      <div className="enquiry-form-heading">
        <span className="enquiry-form-eyebrow">
          PROPERTY ENQUIRY
        </span>

        <h2>Get in Touch</h2>

        <p>
          Interested in this property? Share your details and
          send your enquiry to our team.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="enquiry-form-grid">
          <div className="enquiry-field">
            <label htmlFor="enquiry-name">
              Full Name <span>*</span>
            </label>

            <input
              id="enquiry-name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="enquiry-field">
            <label htmlFor="enquiry-email">
              Email Address <span>*</span>
            </label>

            <input
              id="enquiry-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="enquiry-field enquiry-field-full">
            <label htmlFor="enquiry-phone">
              Phone Number <span>*</span>
            </label>

            <input
              id="enquiry-phone"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </div>

          <div className="enquiry-field enquiry-field-full">
            <label htmlFor="enquiry-message">
              Your Message <span>*</span>
            </label>

            <textarea
              id="enquiry-message"
              name="message"
              placeholder="Tell us what you would like to know about this property..."
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {feedback.message && (
          <div
            className={`enquiry-feedback enquiry-feedback-${feedback.type}`}
            role="status"
            aria-live="polite"
          >
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          className="enquiry-submit-btn"
          disabled={loading}
        >
          {loading ? (
            "Sending Enquiry..."
          ) : (
            <>
              Send Enquiry <span aria-hidden="true">→</span>
            </>
          )}
        </button>

        <p className="enquiry-form-note">
          Your enquiry will be submitted securely through EstateHub.
        </p>
      </form>
    </div>
  );
};

export default EnquiryForm;