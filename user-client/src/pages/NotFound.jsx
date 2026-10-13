import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <main className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-illustration" aria-hidden="true">
          <span className="not-found-house">🏠</span>
          <span className="not-found-question">?</span>
        </div>

        <span className="not-found-eyebrow">
          ESTATEHUB
        </span>

        <h1>404</h1>

        <h2>Oops! Page Not Found</h2>

        <p>
          The page you are looking for may have been moved,
          removed, or is temporarily unavailable.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-home-button">
            Go to Home
          </Link>

          <Link
            to="/properties"
            className="not-found-properties-button"
          >
            Browse Properties
          </Link>
        </div>

        <div className="not-found-footer">
          Find your place with EstateHub.
        </div>
      </div>
    </main>
  );
};

export default NotFound;