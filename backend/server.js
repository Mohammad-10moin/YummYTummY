const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
require("dotenv").config();

const app = express();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ✅ Configure multer for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Security Middleware
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ✅ Body Parsing Middleware (MUST come AFTER multer setup)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Define Routes
const restaurantRoutes = require("./routes/restaurants");
app.use("/api/restaurants", restaurantRoutes);

// ✅ Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error", message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// ✅ Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

module.exports = server;
