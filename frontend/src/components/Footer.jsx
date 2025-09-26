import React, { useState } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add form submission logic here
  };

  return (
    <footer 
      style={{
        backgroundColor: '#1a3d3a',
        color: '#ffffff',
        padding: '60px 0 20px 0'
      }}
    >
      <div className="container-fluid px-4 px-lg-5">
        <div className="row">
          {/* Left Section - Contact Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            {/* Send Us an Email */}
            <div className="mb-4">
              <h4 className="text-white mb-3" style={{ fontSize: '1.2rem', fontWeight: '400' }}>
                Send Us an Email
              </h4>
              <p className="text-light mb-0" style={{ color: '#a0a0a0', fontSize: '0.95rem' }}>
                support@career-9.com
              </p>
            </div>

            {/* Call Us */}
            <div className="mb-4">
              <h4 className="text-white mb-3" style={{ fontSize: '1.2rem', fontWeight: '400' }}>
                Call Us
              </h4>
              <p className="text-light mb-0" style={{ color: '#a0a0a0', fontSize: '0.95rem' }}>
                +91 9392273379
              </p>
            </div>

            {/* Social Media */}
            <div className="mb-4">
              <h4 className="text-white mb-3" style={{ fontSize: '1.2rem', fontWeight: '400' }}>
                Social Media
              </h4>
              <div className="d-flex gap-3">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#4a6b68',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <FaFacebookF style={{ color: '#ffffff', fontSize: '16px' }} />
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#4a6b68',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <FaInstagram style={{ color: '#ffffff', fontSize: '16px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Registration Form */}
          <div className="col-lg-8 col-md-6 offset-lg-2">
            <div className="text-end">
              <h3 className="text-white mb-4" style={{ fontSize: '1.5rem', fontWeight: '400' }}>
                Register Now
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white" style={{ fontSize: '0.9rem' }}>
                      Full Name <span style={{ color: '#ff6b6b' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control"
                      placeholder="Please Enter your Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      style={{
                        backgroundColor: '#2a5955',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#ffffff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white" style={{ fontSize: '0.9rem' }}>
                      Phone Number <span style={{ color: '#ff6b6b' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control"
                      placeholder="Please Enter Your Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      style={{
                        backgroundColor: '#2a5955',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#ffffff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label text-white" style={{ fontSize: '0.9rem' }}>
                    Email <span style={{ color: '#ff6b6b' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Please Enter Your Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      backgroundColor: '#2a5955',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100"
                  style={{
                    backgroundColor: '#1abc9c',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section - Terms & Conditions */}
        <div className="row mt-5 pt-4" style={{ borderTop: '1px solid #2a5955' }}>
          <div className="col-12 text-center">
            <a 
              href="/terms" 
              className="text-light" 
              style={{ 
                textDecoration: 'none', 
                fontSize: '0.9rem',
                color: '#a0a0a0'
              }}
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;