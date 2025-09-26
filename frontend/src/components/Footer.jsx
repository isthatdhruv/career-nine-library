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
        padding: '40px 0 15px 0',
        maxHeight: '400px'
      }}
    >
      <div className="container-fluid px-4 px-lg-5">
        <div className="row">
          {/* Left Section - Contact Info */}
          <div className="col-lg-4 col-md-5 mb-3">
            {/* Send Us an Email */}
            <div className="mb-3">
              <h6 className="text-white mb-2" style={{ fontSize: '1rem', fontWeight: '500' }}>
                Send Us an Email
              </h6>
              <p className="text-light mb-0" style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>
                support@career-9.com
              </p>
            </div>

            {/* Call Us */}
            <div className="mb-3">
              <h6 className="text-white mb-2" style={{ fontSize: '1rem', fontWeight: '500' }}>
                Call Us
              </h6>
              <p className="text-light mb-0" style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>
                +91 9392273379
              </p>
            </div>

            {/* Social Media */}
            <div className="mb-3">
              <h6 className="text-white mb-2" style={{ fontSize: '1rem', fontWeight: '500' }}>
                Social Media
              </h6>
              <div className="d-flex gap-2">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '35px',
                    height: '35px',
                    backgroundColor: '#4a6b68',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <FaFacebookF style={{ color: '#ffffff', fontSize: '14px' }} />
                </div>
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    width: '35px',
                    height: '35px',
                    backgroundColor: '#4a6b68',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                >
                  <FaInstagram style={{ color: '#ffffff', fontSize: '14px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Registration Form */}
          <div className="col-lg-8 col-md-7">
            <div className="text-end">
              <h5 className="text-white mb-3" style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                Register Now
              </h5>
              
              <form onSubmit={handleSubmit}>
                <div className="row mb-2">
                  <div className="col-md-6 mb-2">
                    <label className="form-label text-white" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      Full Name <span style={{ color: '#ff6b6b' }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control form-control-sm"
                      placeholder="Enter your Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      style={{
                        backgroundColor: '#2a5955',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label text-white" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      Phone Number <span style={{ color: '#ff6b6b' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control form-control-sm"
                      placeholder="Enter Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      style={{
                        backgroundColor: '#2a5955',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#ffffff',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-white" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    Email <span style={{ color: '#ff6b6b' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-sm"
                    placeholder="Enter Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={{
                      backgroundColor: '#2a5955',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100 btn-sm"
                  style={{
                    backgroundColor: '#1abc9c',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
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
        <div className="row mt-3 pt-3" style={{ borderTop: '1px solid #2a5955' }}>
          <div className="col-12 text-center">
            <a 
              href="/terms" 
              className="text-light" 
              style={{ 
                textDecoration: 'none', 
                fontSize: '0.8rem',
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