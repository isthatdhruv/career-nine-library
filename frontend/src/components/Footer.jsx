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
      backgroundColor: '#162622',
      color: '#ffffff',
      padding: '40px 0 0 0',
      maxHeight: 'none'
    }}
  >
    <div className="container-fluid px-4 px-lg-5">
      <div className="row" >
        {/* Left Section - Contact Info */}
        <div className="col-lg-6 col-md-6 mb-4 " style={{backgroundColor: '#0d1a16', padding: '80px', maxWidth: '800px', borderRadius: '8px'}}>
          {/* Send Us an Email */}
          <div className="mb-4" >
            <h6 className="text-white mb-2" style={{ fontSize: '2.1rem', fontWeight: '600' }}>
              Send Us an Email
            </h6>
            <p className="mb-0" style={{ color: '#a0a0a0', fontSize: '1.1rem' }}>
              support@career-9.com
            </p>
          </div>

          {/* Call Us */}
          <div className="mb-4">
            <h6 className="text-white mb-2" style={{ fontSize: '2.1rem', fontWeight: '600' }}>
              Call Us
            </h6>
            <p className="mb-0" style={{ color: '#a0a0a0', fontSize: '1.1rem' }}>
              +91 9392273379
            </p>
          </div>

          {/* Social Media */}
          <div className="mb-4">
            <h6 className="text-white mb-3" style={{ fontSize: '2.1rem', fontWeight: '600' }}>
              Social Media
            </h6>
            <div className="d-flex gap-3">
              <div 
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#4a6b68',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5a7b78'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4a6b68'}
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
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5a7b78'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4a6b68'}
              >
                <FaInstagram style={{ color: '#ffffff', fontSize: '16px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Registration Form */}
        <div className="col-lg-6 col-md-6" style={{margin:'35px', padding: '35px', maxWidth: '800px', borderRadius: '8px'}}>
          <div>
            <h5 className="text-white mb-4" style={{ fontSize: '1.3rem', fontWeight: '600' }}>
              Register Now
            </h5>
            
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label text-white" style={{ fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
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
                      backgroundColor: '#2a403c',
                      border: '1px solid #3a504c',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      height: '45px'
                    }}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label text-white" style={{ fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
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
                      backgroundColor: '#2a403c',
                      border: '1px solid #3a504c',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      height: '45px'
                    }}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="form-label text-white" style={{ fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
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
                    backgroundColor: '#2a403c',
                    border: '1px solid #3a504c',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    height: '45px'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn w-100"
                style={{
                  backgroundColor: '#00d4aa',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  height: '50px',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#00c199'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#00d4aa'}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Section - Terms & Conditions */}
    <div 
      style={{ 
        backgroundColor: '#0d1a16',
        marginTop: '40px',
        padding: '15px 0'
      }}
    >
      <div className="container-fluid px-4 px-lg-5">
        <div className="row">
          <div className="col-12 text-center">
            <a 
              href="/terms" 
              className="text-light" 
              style={{ 
                textDecoration: 'none', 
                fontSize: '0.85rem',
                color: '#a0a0a0',
                fontWeight: '400'
              }}
            >
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
}

export default Footer;