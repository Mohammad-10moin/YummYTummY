# 🍽️ YummYTummY Zomato Restaurant Listing & Searching Platform

This project is a full-stack web application that enables users to explore, search, and view detailed information about restaurants from the Zomato dataset. The platform includes:

- A data ingestion service to load the dataset.
- A RESTful API for querying restaurant data.
- A responsive frontend interface for browsing and searching.
- Advanced search features like location-based and image-based cuisine search.

---

## 📁 Project Structure

```

zomato-restaurant-search/
│
├── data-loader/          # ETL script to ingest Zomato dataset
├── backend-api/          # RESTful API built with \[Framework]
├── frontend/             # Web UI built with React
├── docs/                 # API docs, architecture diagrams
└── README.md             # Project overview and setup instructions

````

---

## 🌟 Features

### ✅ Core Features
- **Data Loader:** Loads and cleans Zomato restaurant data from [Kaggle](https://www.kaggle.com/datasets/shrutimehta/zomato-restaurants-data).
- **RESTful API Service:**
  - Get restaurant by ID
  - Paginated restaurant list
  - Location-based search (within X km of latitude/longitude)
- **Frontend Web Application:**
  - Restaurant list and detail views
  - Integrated location-based search
  - Image-based search for cuisine matching

### ✨ Optional Enhancements done
- Filters by country, cuisine, and average cost
- Text search by name/description
- Full-text search using Elasticsearch
- Advanced geospatial indexing for faster location queries

---

## 🏗️ Tech Stack

- **Frontend:** React 
- **Backend API:** Node.js 
- **Database:** MongoDB with geospatial support
- **ML (for image-based search):**  third-party ML API
- **Others:** Postman

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/YummYTummY.git
cd zomato-restaurant-search
````

### 2. Setup Environment Variables

Create a `.env` file in each of the main directories (`data-loader`, `backend-api`, `frontend`) with appropriate variables like:

```bash
# Example for backend
DATABASE_URL=postgresql://user:password@localhost:5432/zomato
API_KEY=your-api-key-if-needed
```

### 3. Load the Dataset

```bash
cd data-loader
python load_data.py
```

### 4. Run the Backend API

```bash
cd backend
# For Node.js
npm install
npm start
# Or for Python (FastAPI, Django)
uvicorn main:app --reload
```

### 5. Run the Frontend App

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### `/restaurants/:id`

Get detailed info for a restaurant.

### `/restaurants`

Get paginated list of restaurants. Supports query params:

* `page`
* `limit`

### `/restaurants/search/location`

Search restaurants near a coordinate:

* `latitude`
* `longitude`
* `radius` (default 3 km)

### `/restaurants/search/image`

Upload an image (e.g. ice cream, pasta) and get restaurants offering similar cuisines.

---

## 🧪 Testing

```bash
# Backend Tests
cd backend
npm test  # or pytest

# Frontend Tests
cd frontend
npm test
```

---

## 🛠 Future Improvements

* Authentication for user favorites/bookmarks
* Admin panel for moderating data
* UI/UX improvements with animations and maps
* Mobile responsiveness and PWA support

---

## 🧑‍💻 Contributing

We welcome contributions! Please open issues or submit pull requests.

```bash
# Format your code
npm run lint

# Run tests
npm test
```

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

* Zomato Dataset by [Shruti Mehta on Kaggle](https://www.kaggle.com/datasets/shrutimehta/zomato-restaurants-data)
* Open source tools and libraries from the community

---

