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
  };

  return (
    <footer
      style={{
        background: "#0E1F1C",
        padding: "80px 0",
        color: "#fff",
      }}
    >
      <div className="container-fluid px-4 px-lg-5">
        {/* Use Bootstrap's grid without forcing display:flex on the row.
            This keeps the two columns side-by-side on large screens. */}
        <div className="row g-4" style={{ alignItems: "stretch" }}>
          {/* LEFT SECTION */}
          <div
            className="col-lg-6 col-md-6"
            style={{
              background: "#081512",
              padding: "60px",
              borderRadius: "25px",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontSize: "32px", marginBottom: "20px", color: "#ffffff" }}>
                Send Us an Email
              </h3>
              <p style={{ color: "#ffffff", fontSize: "20px", marginTop: 0 }}>
                support@career-9.com
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "32px", marginBottom: "20px", color: "#ffffff" }}>
                Call Us
              </h3>
              <p style={{ color: "#bfbfbf", fontSize: "20px", marginTop: 0 }}>
                +91 7000070256
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "32px", marginBottom: "20px", color: "#ffffff" }}>
                Social Media
              </h3>
              <div className="d-flex gap-4">
                <a
                  href="https://www.facebook.com/people/Career-9/61567696780160/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Career-9 Facebook"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      width: "55px",
                      height: "55px",
                      background: "#E5E7EB",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <FaFacebookF color="#000" size={22} />
                  </div>
                </a>

                <a
                  href="https://www.instagram.com/career_9_?igsh=MTNtd3lmcXh4cW4weQ%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Career-9 Instagram"
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      width: "55px",
                      height: "55px",
                      background: "#E5E7EB",
                      borderRadius: "50%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <FaInstagram color="#000" size={24} />
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div
            className="col-lg-6 col-md-6"
            style={{
              background: "transparent",
              padding: "60px",
              borderRadius: "25px",
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              boxShadow: "none"
            }}
          >
            <h2 style={{ fontSize: "36px", marginBottom: "40px", color: "#ffffff" }}>
              Register Now
            </h2>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <div className="row mb-4">
                <div className="col-12 col-md-6 mb-4">
                  <label style={{ fontSize: "16px", color: "#ffffff" }}>
                    Full Name <span style={{ color: "#00E9B6" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      background: "#20312E",
                      border: "none",
                      padding: "18px",
                      borderRadius: "15px",
                      marginTop: "6px",
                      color: "#fff",
                      fontSize: "17px",
                    }}
                  />
                </div>

                <div className="col-12 col-md-6 mb-4">
                  <label style={{ fontSize: "16px", color: "#ffffff" }}>
                    Phone Number <span style={{ color: "#00E9B6" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      background: "#20312E",
                      border: "none",
                      padding: "18px",
                      borderRadius: "15px",
                      marginTop: "6px",
                      color: "#fff",
                      fontSize: "17px",
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label style={{ fontSize: "16px", color: "#ffffff" }}>
                  Email <span style={{ color: "#00E9B6" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    background: "#20312E",
                    border: "none",
                    padding: "18px",
                    borderRadius: "15px",
                    marginTop: "6px",
                    color: "#fff",
                    fontSize: "17px",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "#00E9B6",
                  border: "none",
                  padding: "18px",
                  borderRadius: "15px",
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#000",
                  marginTop: "10px",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
