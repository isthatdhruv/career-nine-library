import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <style>{`
        .c9-nav-links {
          gap: 20px;
          font-family: Manrope, sans-serif;
          font-size: 18px;
          font-weight: 800;
        }
        .c9-nav-links .nav-link {
          padding: 0 !important;
          font-weight: 800 !important;
          text-decoration: none;
          outline: none;
        }
        .c9-logo-img {
          max-height: 84px;
          height: 84px;
        }
        .c9-login-btn {
          padding: 14px 30px;
          font-size: 18px;
        }
        @media (max-width: 991.98px) {
          .c9-nav-links {
            gap: 0 !important;
            font-size: 16px;
            text-align: center;
            padding: 10px 0;
          }
          .c9-nav-links .nav-link {
            padding: 10px 0 !important;
            border-bottom: 1px solid #eee;
          }
          .c9-nav-links .nav-item:last-child .nav-link {
            border-bottom: none;
          }
          .c9-logo-img {
            max-height: 50px;
            height: 50px;
          }
          .c9-login-btn {
            padding: 10px 24px;
            font-size: 15px;
          }
        }
      `}</style>
      <nav
        className="navbar navbar-expand-lg navbar-light bg-white shadow-sm"
        style={{
          zIndex: 1050,
          borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          backgroundColor: 'rgba(255,255,255,0.98)',
        }}
      >
        <div className="container-fluid px-2 px-lg-3">

          {/* Logo Section */}
          <Link className="navbar-brand d-flex align-items-center" to="https://career-9.com/">
            <img
              className="img-fluid c9-logo-img"
              style={{ borderRadius: '0px', boxShadow: 'none', filter: 'none', background: 'transparent' }}
              src="/logo.png"
              alt="Career-9"
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
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 c9-nav-links align-items-center">
              <li className="nav-item">
                <Link className="nav-link text-dark fw-bold" to="https://career-9.com/#why-career-9">
                  Why Career-9?
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark fw-bold" to="https://career-9.com/#our-solution">
                  Our Solution
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark fw-bold" to="https://career-9.com/#testimonials">
                  Testimonials
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark fw-bold" to="https://career-9.com/#our-team">
                  Our Team
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-dark fw-bold" to="https://career-9.com/#Blog">
                  Blogs
                </Link>
              </li>
            </ul>

            {/* Action Button */}
            <div className="d-flex justify-content-center justify-content-lg-end mt-2 mt-lg-0">
              <a href="https://career-9.com/sign-up/" style={{ textDecoration: 'none' }}>
                <button
                  className="c9-login-btn"
                  style={{
                    background: '#00d486',
                    border: 'none',
                    color: '#000000',
                    borderRadius: '18px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Login/Register
                </button>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
