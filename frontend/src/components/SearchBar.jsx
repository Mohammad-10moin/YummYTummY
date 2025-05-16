import React, { useState } from "react";
import "../styles/SearchBar.css";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim() !== "") {
      onSearch(query);
    }
  };

  return (
    <div className="search-bar">
      <div className="search-input">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for restaurants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Trigger search on Enter
        />
      </div>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
