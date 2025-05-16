const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  restaurant_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  location: {
    type: { type: String, default: 'Point', enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  cuisines: { type: [String], required: true },
  average_cost_for_two: { type: Number, required: true },
  currency: { type: String, required: true },
  has_online_delivery: { type: Boolean, default: false },
  price_range: { type: Number, min: 1, max: 4 },
  aggregate_rating: { type: Number, default: 0, min: 0, max: 5 },
  votes: { type: Number, default: 0 },
  image_url: { 
    type: String, 
    match: /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i, 
    required: false 
  }
});

// Create geospatial index
restaurantSchema.index({ location: '2dsphere' });

// Optional: Index for commonly queried fields
restaurantSchema.index({ city: 1, country: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
