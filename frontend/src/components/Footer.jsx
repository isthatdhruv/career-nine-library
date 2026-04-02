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
        padding: "30px 0",
        color: "#fff",
      }}
    >
      <div className="container-fluid px-3 px-lg-4">
        <div className="row g-3" style={{ alignItems: "stretch" }}>
          {/* LEFT SECTION */}
          <div className="col-12 col-md-5">
            <div
              style={{
                background: "#081512",
                padding: "20px",
                borderRadius: "14px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontSize: "18px", marginBottom: "6px", color: "#ffffff" }}>
                  Send Us an Email
                </h3>
                <p style={{ color: "#ffffff", fontSize: "14px", marginTop: 0, marginBottom: "16px" }}>
                  support@career-9.com
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "18px", marginBottom: "6px", color: "#ffffff" }}>
                  Call Us
                </h3>
                <p style={{ color: "#bfbfbf", fontSize: "14px", marginTop: 0, marginBottom: "16px" }}>
                  +91 7000070256
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#ffffff" }}>
                  Social Media
                </h3>
                <div className="d-flex gap-2">
                  <a
                    href="https://www.facebook.com/people/Career-9/61567696780160/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Career-9 Facebook"
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        background: "#E5E7EB",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <FaFacebookF color="#000" size={14} />
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
                        width: "36px",
                        height: "36px",
                        background: "#E5E7EB",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      <FaInstagram color="#000" size={16} />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="col-12 col-md-7">
            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
              }}
            >
              <h2 style={{ fontSize: "20px", marginBottom: "16px", color: "#ffffff" }}>
                Register Now
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="row mb-2">
                  <div className="col-12 col-sm-6 mb-2">
                    <label style={{ fontSize: "13px", color: "#ffffff" }}>
                      Full Name <span style={{ color: "#00E9B6" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      style={{
                        background: "#20312E",
                        border: "none",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        marginTop: "4px",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  <div className="col-12 col-sm-6 mb-2">
                    <label style={{ fontSize: "13px", color: "#ffffff" }}>
                      Phone Number <span style={{ color: "#00E9B6" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      style={{
                        background: "#20312E",
                        border: "none",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        marginTop: "4px",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <label style={{ fontSize: "13px", color: "#ffffff" }}>
                    Email <span style={{ color: "#00E9B6" }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="form-control"
                    style={{
                      background: "#20312E",
                      border: "none",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      marginTop: "4px",
                      color: "#fff",
                      fontSize: "13px",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn w-100"
                  style={{
                    background: "#00E9B6",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#000",
                    marginTop: "6px",
                    cursor: "pointer",
                  }}
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
