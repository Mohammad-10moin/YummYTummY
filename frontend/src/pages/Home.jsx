import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import RestaurantCard from "../components/RestaurantCard";
import axios from "axios";
import "../styles/Home.css";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = (queryPage = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (filters.country) params.append("country", filters.country);
    if (filters.cuisine) params.append("cuisine", filters.cuisine);
    if (filters.averageSpend) params.append("averageSpend", filters.averageSpend);
    params.append("page", queryPage);
    params.append("limit", 9);

    axios
      .get(`http://localhost:5000/api/restaurants/restaurants?${params.toString()}`)
      .then((res) => {
        console.log("Fetched Restaurants:", res.data.results);
        setRestaurants(res.data.results || []);
        setTotalPages(res.data.totalPages);
        setPage(queryPage);
      })
      .catch((err) => {
        console.error("Error fetching restaurants:", err);
        setRestaurants([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <div className="home">
      <SearchBar onSearch={(query) => { setSearchQuery(query); fetchRestaurants(); }} />
      <Filters onFilterChange={(newFilters) => { setFilters(newFilters); fetchRestaurants(); }} />
      
      {loading ? (
        <p>Loading restaurants...</p>
      ) : (
        <div className="restaurant-list">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
            ))
          ) : (
            <p>No restaurants found.</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => fetchRestaurants(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => fetchRestaurants(page + 1)} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
