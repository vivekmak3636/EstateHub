import { useNavigate } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <div className="not-found-icon">⌂</div>
        <h1>Page Not Found</h1>
        <p>
          Sorry, the page you are looking for does not exist or may have been moved.
        </p>
        <div className="not-found-actions">
          <button
            type="button"
            className="not-found-primary"
            onClick={() => navigate("/dashboard", { replace: true })}
          >
            Back to Dashboard
          </button>
          <button
            type="button"
            className="not-found-secondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;