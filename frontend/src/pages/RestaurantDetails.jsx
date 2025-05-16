import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaStar, FaExternalLinkAlt } from "react-icons/fa";
import "../styles/RestaurantDetails.css";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/restaurants/restaurants/${id}`)
      .then((res) => setRestaurant(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!restaurant) return <p className="loading-text">Loading...</p>;

  return (
    <div className="restaurant-details">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

      {/* Restaurant Image */}
      <div className="image-container1">
        <img src={restaurant.restaurant_image_url} alt={restaurant.name} />
      </div>

      {/* Restaurant Header (Name, Rating & Cost) */}
      <div className="details-header">
        <div className="rating">
           {restaurant.aggregate_rating} ⭐
        </div>
        <h2>{restaurant.name}</h2>
        <div className="cost">
          💰 {restaurant.average_cost_for_two} {restaurant.currency}
        </div>
      </div>

      {/* Cuisine */}
      <p className="cuisine">{restaurant.cuisines.join(", ")}</p>

      {/* Location & Address */}
      <p className="location">
        <FaMapMarkerAlt /> {restaurant.city}, {restaurant.country}
      </p>
      <p className="address">📍 {restaurant.address}</p>

      {/* Delivery Status */}
      <p className="delivery-status">
        {restaurant.has_online_delivery ? "🚀 Online Delivery Available" : "❌ No Online Delivery"}
      </p>

      {/* External Link */}
      <a href={restaurant.restaurant_url} className="restaurant-link" target="_blank" rel="noopener noreferrer">
        Visit Website <FaExternalLinkAlt />
      </a>
    </div>
  );
};

export default RestaurantDetails;
