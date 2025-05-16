import axios from "axios";

export const fetchRestaurants = async (params) => {
  const response = await axios.get("/api/restaurants/restaurants/", { params });
  return response.data;
};

export const fetchRestaurantById = async (id) => {
  const response = await axios.get(`/api/restaurants/restaurants/${id}`);
  return response.data;
};

export const searchByImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  const response = await axios.post("/api/restaurants/restaurants/image-search", formData);
  return response.data;
};
