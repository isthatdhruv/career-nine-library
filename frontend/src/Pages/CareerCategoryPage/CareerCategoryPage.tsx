import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import Section from "../../components/Section/Section.tsx";
// Add this import at the top of CareerCategoryPage.tsx
import "./CareerCategoryPage.css";
const CareerCategoryPage = () => {

  const category = new URLSearchParams(window.location.search).get('/*');
  console.log("Category from URL:", category);








  return (
    <div className="container-fluid d-flex flex-column min-vh-100 p-0">
      <Header />
      <Section />
      {/* Main Content Section */}
      <div className="container my-5 flex-grow-1">
        {/* Title and Dropdown Section */}
        <div className="row mb-4">
          <div className="col-md-8">
            <h2 className="fw-bold text-dark mb-0">Computer Application & IT</h2>
          </div>
          <div className="col-md-4 text-md-end">
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle px-4"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ minWidth: '200px' }}
              >
                Choose another Career
              </button>
              <ul className="dropdown-menu w-100">
                <li><a className="dropdown-item" href="#">Engineering</a></li>
                <li><a className="dropdown-item" href="#">Architecture</a></li>
                <li><a className="dropdown-item" href="#">Aviation</a></li>
                <li><a className="dropdown-item" href="#">Merchant Navy</a></li>
                <li><a className="dropdown-item" href="#">Physical Science</a></li>
                <li><a className="dropdown-item" href="#">Life Science & Environment</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="text-muted lh-lg" style={{ fontSize: '1rem' }}>
              <p className="mb-3">
                In today's techno-savvy world, no industry survives without adopting the latest technology & hence graduates in the field of computer applications are always in demand.
                Bachelors in the computer application is a mainstream career option and a very sought-after course amongst students. A degree in computer application creates
                substantial scope for an excellent career.
              </p>

              <p className="mb-3">
                Entry to premier colleges requires students to pass an entrance exam. Considering the fast pace growth of this sector, lots of students are pursuing this career path thus
                making it increasingly competitive. Graduates in this field need to constantly upgrade their skill set to keep up with the rapidly changing technology. For a career in
                Computer Application one can do BCA, a three year bachelor program and follow it up with MCA, a masters program. While its imperative to have Mathematics at 10+2
                level, it's also recommended that the candidate chooses a combination of Science (Physics, Chemistry, Maths) with Computer Science as it increases the odds of grasping
                concepts faster.
              </p>

              <p className="mb-3">
                While demand for Computer Application Graduates is becoming sector agnostic, companies like Accenture, TCS, TechMahindra, IGATE and StartUps like Flipkart & UBER
                continue to be the top recruiters.
              </p>

              <p className="mb-4">
                <strong>Trending fields:</strong> Web/ Mobile Design Engineer, Web/ Mobile App Developer, UI/UX Designers, Technical Writers
              </p>
            </div>
          </div>
        </div>

        {/* Career Cards Section */}
        <div className="row g-4">
          {/* Sample Card 1 - Computer Application and IT */}
          <div className="col-12 col-sm-6 col-lg-4">
            <div
              className="card h-100 border-0 shadow-sm position-relative overflow-hidden career-card"
              onClick={() => {
                console.log('Navigate to Computer Application and IT details');
              }}
              style={{
                cursor: 'pointer',
                minHeight: '250px',
                background: 'linear-gradient(135deg, #1abc9c 0%, #16a085 100%)'
              }}
            >
              <div className="card-img-overlay d-flex align-items-end p-0">
                <div className="w-100 text-center p-4" style={{
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                }}>
                  <h5 className="card-title text-white fw-bold mb-0">
                    Computer Application and IT
                  </h5>
                </div>
              </div>

              {/* Placeholder Icon */}
              <div className="position-absolute top-50 start-50 translate-middle">
                <i className="bi bi-laptop" style={{
                  fontSize: '4rem',
                  color: 'rgba(255,255,255,0.3)'
                }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerCategoryPage;