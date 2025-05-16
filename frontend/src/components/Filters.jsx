import React, { useState } from "react";
import "../styles/Filters.css";

const Filters = ({ onFilterChange }) => {
  const [country, setCountry] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [averageSpend, setAverageSpend] = useState("");

  const handleFilterChange = () => {
    const filters = { country, cuisine, averageSpend };
    onFilterChange(filters);
  };

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Enter Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

      <input
        type="text"
        placeholder="Cuisine Type"
        value={cuisine}
        onChange={(e) => setCuisine(e.target.value)}
      />

      <input
        type="number"
        placeholder="Average Spend ₹"
        onChange={(e) => setAverageSpend(`${e.target.value}-${e.target.value}`)}
      />

      <button onClick={handleFilterChange}>Apply</button>
    </div>
  );
};

export default Filters;
