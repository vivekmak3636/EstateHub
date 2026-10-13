
import { useState } from "react";
import "./SearchBar.css";

const SearchBar = ({
  onSearch,
  initialValues = {},
  placeholder = "Enter city, location or keyword",
}) => {
  const [searchData, setSearchData] = useState({
    keyword: initialValues.keyword || "",
    location: initialValues.location || "",
    propertyType: initialValues.propertyType || "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSearchData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (typeof onSearch === "function") {
      onSearch({
        keyword: searchData.keyword.trim(),
        location: searchData.location.trim(),
        propertyType: searchData.propertyType,
      });
    }
  };

  const handleReset = () => {
    const emptyValues = {
      keyword: "",
      location: "",
      propertyType: "",
    };

    setSearchData(emptyValues);

    if (typeof onSearch === "function") {
      onSearch(emptyValues);
    }
  };

  return (
    <form
      className="estate-search-bar"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="estate-search-field estate-search-keyword">
        <label htmlFor="estate-search-keyword">
          Search Property
        </label>

        <div className="estate-search-input-wrap">
          <span className="estate-search-icon" aria-hidden="true">
            ⌕
          </span>

          <input
            id="estate-search-keyword"
            type="search"
            name="keyword"
            placeholder={placeholder}
            value={searchData.keyword}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="estate-search-field">
        <label htmlFor="estate-search-location">
          Location
        </label>

        <div className="estate-search-input-wrap">
          <span className="estate-search-icon" aria-hidden="true">
            ◎
          </span>

          <input
            id="estate-search-location"
            type="text"
            name="location"
            placeholder="City or area"
            value={searchData.location}
            onChange={handleChange}
            autoComplete="address-level2"
          />
        </div>
      </div>

      <div className="estate-search-field estate-search-type">
        <label htmlFor="estate-search-property-type">
          Property Type
        </label>

        <select
          id="estate-search-property-type"
          name="propertyType"
          value={searchData.propertyType}
          onChange={handleChange}
        >
          <option value="">All Types</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="villa">Villa</option>
          <option value="plot">Plot / Land</option>
          <option value="commercial">Commercial</option>
        </select>
      </div>

      <div className="estate-search-actions">
        <button type="submit" className="estate-search-submit">
          <span aria-hidden="true">⌕</span>
          Search
        </button>

        <button
          type="button"
          className="estate-search-reset"
          onClick={handleReset}
          aria-label="Clear search filters"
          title="Clear search"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
