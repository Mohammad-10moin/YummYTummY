import React, { useState } from "react";
import axios from "axios";
import RestaurantCard from "../components/RestaurantCard";
import { FaSearch, FaUpload } from "react-icons/fa";
import "../styles/ImageSearch.css";

const ImageSearch = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const fetchImageSearchResults = (queryPage) => {
    if (!image) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("imageFile", image);

    axios
      .post(`http://localhost:5000/api/restaurants/image-search`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { page: queryPage, limit: 9 },
      })
      .then((res) => {
        console.log("Image Search Results:", res.data.results);
        setRestaurants(res.data.results);
        setTotalPages(res.data.totalPages);
        setPage(queryPage);
      })
      .catch((err) => {
        console.error("Error in image search:", err);
        alert("Image search failed. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="image-search-container">
      <h2>Search by Food Image</h2>
      <p className="description">
        Upload a picture of your favorite dish and we'll find restaurants serving similar food near you.
      </p>

      <label className="drop-area">
        <div className="upload-content">
          <FaUpload className="upload-icon" />
          <p className="drop-text">Drag and drop your image here</p>
          <span className="browse-text">or click to browse from your device</span>
        </div>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </label>

      {preview && (
        <div className="preview-container">
          <img src={preview} alt="Uploaded Preview" className="preview-image" />
        </div>
      )}

      <button className="upload-btn" onClick={() => fetchImageSearchResults(1)} disabled={loading}>
        {loading ? "Searching..." : "Find Similar Dishes"}
        <FaSearch className="search-icon" />
      </button>

      {loading ? (
        <p>Loading restaurants...</p>
      ) : (
        <div className="restaurant-list">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
            ))
          ) : (
            <p>No matching restaurants found.</p>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination1">
          <button onClick={() => fetchImageSearchResults(page - 1)} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => fetchImageSearchResults(page + 1)} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSearch;
