import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = () => {
    // Add login logic here
    console.log('Login clicked');
  };

  const handleRegister = () => {
    // Add register logic here
    console.log('Register now clicked');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container-fluid px-3 px-lg-5">
        
        {/* Logo Section */}
        <Link className="navbar-brand d-flex align-items-center " to="/">
          <img style={{maxHeight: '70px', borderRadius: '0px'}}
            src="/logo.png" 
            alt="Career-9" 
            height="70px" 
            className="img-fluid"
          />
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav" 
          aria-expanded={isMenuOpen} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Menu */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          
          {/* Center Navigation Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item mx-2">
              <Link className="nav-link fw-large text-dark px-3 py-2" to="/mission">
                Our Mission
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link fw-medium text-dark px-3 py-2" to="/why-career-9">
                Why Career-9?
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link fw-medium text-dark px-3 py-2" to="/solution">
                Our Solution
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link fw-medium text-dark px-3 py-2" to="/testimonials">
                Testimonials
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link fw-medium text-dark px-3 py-2" to="/team">
                Our Team
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link fw-medium text-dark px-3 py-2" to="/blogs">
                Blogs
              </Link>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="d-flex gap-2 ms-auto">
            <button 
              className="btn btn-outline-dark px-4 py-2 fw-semibold"
              onClick={handleLogin}
            >
              Log In
            </button>
            <button 
              className="btn btn-success  px-4 py-2 fw-semibold"
              style={{
                background: 'linear-gradient(45deg, #1abc9c, #16a085)',
                border: 'none',
                boxShadow: '0 2px 10px rgba(26, 188, 156, 0.3)'
              }}
              onClick={handleRegister}
            >
              Register now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
