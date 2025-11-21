import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white shadow-sm"
      style={{
        position: 'fixed',
        top: '18px',
        left: '24px',
        right: '24px',
        zIndex: 1050,
        borderRadius: '14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        paddingTop: '14px',
        paddingBottom: '14px',
        backgroundColor: 'rgba(255,255,255,0.98)'
      }}
    >
      <div className="container-fluid px-3 px-lg-5" style={{ paddingTop: '4px', paddingBottom: '4px', position: 'relative' }}>
        
        {/* Logo Section */}
        <Link className="navbar-brand d-flex align-items-center" to="https://career-9.com/">
          <img
            style={{ maxHeight: '84px', height: '84px', borderRadius: '0px', boxShadow: 'none', filter: 'none', background: 'transparent' }}
            src="/logo.png"
            alt="Career-9"
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
          <ul
            className="navbar-nav mx-auto mb-2 mb-lg-0"
            style={{
              display: 'flex',
              gap: '36px',
              alignItems: 'center',
              fontFamily: 'Manrope, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}
          >
            <li className="nav-item">
              <Link className="nav-link text-dark" to="https://career-9.com/#why-career-9" style={{ padding: '0', fontWeight: 700, textDecoration: 'none', outline: 'none' }}>
                Why Career-9?
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" to="https://career-9.com/#our-solution" style={{ padding: '0', fontWeight: 700, textDecoration: 'none', outline: 'none' }}>
                Our Solution
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" to="https://career-9.com/#testimonials" style={{ padding: '0', fontWeight: 700, textDecoration: 'none', outline: 'none' }}>
                Testimonials
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" to="https://career-9.com/#our-team" style={{ padding: '0', fontWeight: 700, textDecoration: 'none', outline: 'none' }}>
                Our Team
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" to="https://career-9.com/#Blog" style={{ padding: '0', fontWeight: 700, textDecoration: 'none', outline: 'none' }}>
                Blogs
              </Link>
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="d-flex align-items-center ms-auto" style={{ gap: '14px' }}>
            <a href="https://career-9.com/sign-up/" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: '#ffffff',
                  border: '1px solid #020101',
                  color: '#020101',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 700
                }}
              >
                Log In
              </button>
            </a>

            <a href="https://career-9.com/sign-up/" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    background: '#00d486',
                    border: 'none',
                    color: '#000000',
                    padding: '14px 30px',
                    borderRadius: '18px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  Register now
                </button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
