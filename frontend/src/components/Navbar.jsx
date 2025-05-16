import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

const links = [
  { link: "/", label: "Home" },
  { link: "/nearby", label: "Location Search" },
  { link: "/image-search", label: "Image Search" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(links[0].link);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLinkClick = (link) => {
    setActive(link);
    setMenuOpen(false); // Close menu on mobile after clicking
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo and Title */}
        <Link to="/" className="navbar-logo-container">
          <img src={logo} alt="YummyTummy" className="navbar-logo" />
          <span className="navbar-title">YummyTummy</span>
        </Link>

        {/* Navigation Links */}
        <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
          {links.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className={`nav-link ${active === item.link ? "active-link" : ""}`}
              onClick={() => handleLinkClick(item.link)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Burger Menu for Mobile */}
        <div className="burger-menu" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
