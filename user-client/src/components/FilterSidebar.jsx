
import { useEffect, useState } from "react";
import "./FilterSidebar.css";

const initialFilters = {
  location: "",
  propertyType: "",
  listingType: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "",
};

const normalizeListingType = (value) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (["sale", "buy", "for sale", "sell", "purchase"].includes(normalized)) {
    return "sale";
  }

  if (["rent", "for rent", "rental", "lease", "to rent"].includes(normalized)) {
    return "rent";
  }

  return "";
};

const FilterSidebar = ({
  onApplyFilters,
  onResetFilters,
  initialValues = {},
}) => {
  const [filters, setFilters] = useState(() => ({
    ...initialFilters,
    ...initialValues,
    listingType: normalizeListingType(initialValues.listingType),
  }));

  // Update the sidebar when parent filters or URL values change.
  useEffect(() => {
    setFilters({
      ...initialFilters,
      ...initialValues,
      listingType: normalizeListingType(initialValues.listingType),
    });
  }, [
    initialValues.location,
    initialValues.propertyType,
    initialValues.listingType,
    initialValues.minPrice,
    initialValues.maxPrice,
    initialValues.bedrooms,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]:
        name === "listingType" ? normalizeListingType(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      filters.minPrice !== "" &&
      filters.maxPrice !== "" &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      alert("Minimum price maximum price કરતાં વધારે ન હોઈ શકે.");
      return;
    }

    onApplyFilters?.({
      ...filters,
      listingType: normalizeListingType(filters.listingType),
    });
  };

  const handleReset = () => {
    setFilters({ ...initialFilters });

    if (onResetFilters) {
      onResetFilters();
    } else {
      onApplyFilters?.({ ...initialFilters });
    }
  };

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <div>
          <span className="filter-eyebrow">ESTATEHUB</span>
          <h2>Filter Properties</h2>
          <p>Find a property that suits you.</p>
        </div>

        <span className="filter-header-icon" aria-hidden="true">
          ⚙
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="filter-group">
          <label htmlFor="filter-location">Location</label>

          <div className="filter-input-wrap">
            <span aria-hidden="true">⌖</span>
            <input
              id="filter-location"
              name="location"
              type="text"
              placeholder="City or area"
              value={filters.location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-listingType">Looking to</label>

          <select
            id="filter-listingType"
            name="listingType"
            value={filters.listingType}
            onChange={handleChange}
          >
            <option value="">Buy or Rent</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-propertyType">Property Type</label>

          <select
            id="filter-propertyType"
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
          >
            <option value="">All Property Types</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot / Land</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Price Range (₹)</label>

          <div className="filter-price-row">
            <input
              aria-label="Minimum price"
              name="minPrice"
              type="number"
              min="0"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={handleChange}
            />

            <span className="filter-price-separator">—</span>

            <input
              aria-label="Maximum price"
              name="maxPrice"
              type="number"
              min="0"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-bedrooms">Bedrooms</label>

          <select
            id="filter-bedrooms"
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
          >
            <option value="">Any Bedrooms</option>
            <option value="1">1+ Bedroom</option>
            <option value="2">2+ Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
          </select>
        </div>

        <div className="filter-actions">
          <button type="submit" className="filter-apply-btn">
            Apply Filters <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            className="filter-reset-btn"
            onClick={handleReset}
          >
            Reset Filters
          </button>
        </div>
      </form>
    </aside>
  );
};

export default FilterSidebar;
