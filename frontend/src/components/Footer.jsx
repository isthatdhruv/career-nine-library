import React from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
     <footer className="cl-footer">
        <div className="footer-section">
          <h3>Call Our Helpline</h3>
          <p>Got career-related questions? Talk to our experts!</p>
          <strong>+91 87449 87449</strong>
        </div>
        <div className="footer-section">
          <h3>Subscribe to our Newsletter</h3>
          <p>
            Expert-written articles and everything else you need to choose the
            right career, delivered weekly to your inbox.
          </p>
          <div className="subscribe-bar">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
        <div className="footer-section">
          <h3>Stay Connected</h3>
          <div className="social-icons">
            <FaTwitter />
            <FaFacebookF />
            <FaInstagram />
            <FaLinkedinIn  />
          </div>
        </div>
      </footer>
  );
};

export default Footer;