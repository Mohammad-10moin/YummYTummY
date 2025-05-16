import React, { useState, useEffect } from "react";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";
import { FaMapMarkerAlt, FaSearch, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "../styles/NearbyRestaurants.css";
import BackgroundBeamsWithCollision from "../components/ui/BBC"; // Background animation

const NearbyRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch nearby restaurants
  const fetchNearbyRestaurants = (queryPage) => {
    if (!latitude || !longitude) {
      alert("Please enter latitude and longitude.");
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/restaurants/nearby`, {
        params: {
          lat: latitude,
          lng: longitude,
          page: queryPage,
          limit: 9,
        },
      })
      .then((res) => {
        setRestaurants(res.data.results || []);
        setTotalPages(res.data.totalPages);
        setPage(queryPage);
      })
      .catch((err) => {
        console.error("Error fetching nearby restaurants:", err);
        alert("Failed to fetch nearby restaurants.");
      })
      .finally(() => setLoading(false));
  };

  // Auto-fill latitude & longitude using Geolocation
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location.");
      }
    );
  };

  return (
    <div className="nearby-restaurants">
      <BackgroundBeamsWithCollision /> {/* Background Animation */}

      <div className="container">
        <h2>Nearby Restaurants</h2>

        {/* Location Input Section */}
        <div className="location-inputs">
          <input
            type="number"
            placeholder="Enter Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
          <input
            type="number"
            placeholder="Enter Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
          <button className="search-btn" onClick={() => fetchNearbyRestaurants(1)}>
            <FaSearch /> Search Nearby
          </button>
          <button className="location-btn" onClick={fetchCurrentLocation}>
            <FaMapMarkerAlt /> Use My Location
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <p className="loading-text">Loading restaurants...</p>
        ) : (
          <div className="restaurant-list">
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
              ))
            ) : (
              <p className="no-results">No nearby restaurants found.</p>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => fetchNearbyRestaurants(page - 1)} disabled={page === 1}>
              <FaArrowLeft /> Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => fetchNearbyRestaurants(page + 1)} disabled={page === totalPages}>
              Next <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyRestaurants;
