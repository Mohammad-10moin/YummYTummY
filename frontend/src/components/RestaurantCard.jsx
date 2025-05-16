import React from "react";
import { Link } from "react-router-dom"; // ✅ Import Link for navigation
import { FaMapMarkerAlt, FaRegBookmark } from "react-icons/fa";
import "../styles/RestaurantCard.css";

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      {/* Restaurant Image with Bookmark Icon */}
      <div className="image-container">
        <img src={restaurant.restaurant_image_url} alt={restaurant.name} />
        <div className="bookmark-icon">
          <FaRegBookmark size={18} />
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="restaurant-info">
        <div className="restaurant-header">
          <h3 className="restaurant-name">{restaurant.name}</h3>
          <span className="rating-badge">
            {restaurant.aggregate_rating} <span>★</span>
          </span>
        </div>
        <p className="restaurant-cuisines">{restaurant.cuisines.join(", ")}</p>
        <p className="restaurant-spend">₹{restaurant.average_cost_for_two} for two</p>
        <p className="restaurant-location">
          <FaMapMarkerAlt size={12} className="location-icon" /> {restaurant.city}, {restaurant.country}
        </p>

        {/* ✅ "Details" Button for Navigation */}
        <Link to={`/restaurant/${restaurant.restaurant_id}`} className="details-button">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;
