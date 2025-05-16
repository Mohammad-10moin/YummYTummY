import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RestaurantDetails from "./pages/RestaurantDetails";
import NearbyRestaurants from "./pages/NearbyRestaurants";
import ImageSearch from "./pages/ImageSearch";
import Layout from "./components/Layout";
import BackgroundBeamsWithCollision from "./components/ui/BBC";

function App() {
  return (
    <>
      {/* Background Animation is fixed & separate */}
      <BackgroundBeamsWithCollision />

      {/* Main Content (Scrollable) */}
      <div className="relative z-10 min-h-screen">
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/nearby" element={<NearbyRestaurants />} />
            <Route path="/image-search" element={<ImageSearch />} />
          </Routes>
        </Layout>
      </div>
    </>
  );
}

export default App;
