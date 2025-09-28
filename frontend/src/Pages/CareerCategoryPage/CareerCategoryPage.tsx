import React, { use, useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import Section from "../../components/Section/Section.tsx";
import "./CareerCategoryPage.css";
import { useParams } from "react-router";
import { doc, collection, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";

const CareerCategoryPage = () => {
  const { category } = useParams<{ category?: string }>();
  const [description, setDescription] = React.useState<string>("");

  
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when component mounts
    const fetchMapping = async () => {
      const temp = doc(collection(db, 'categoryDescription'), 'description');
      const DescriptionSnap = await getDoc(temp);
      const descriptionData = DescriptionSnap.data();
      
      const desc = descriptionData ? descriptionData[category as string] : "Description not available.";
      setDescription(desc);



    };

    fetchMapping();
  }, []);

  return (
    <div className="container-fluid d-flex flex-column min-vh-100 p-0">
      <Header />
      <Section />

      {/* Main Content Section */}
      <div className="container my-5 flex-grow-1">
        {/* Title and Dropdown Section */}
        <div className="row mb-2 align-items-start align-items-lg-center">
          <div className="col-12 col-lg-8 order-2 order-lg-1">
            <h2 className="category-title fw-bold text-dark mb-0 text-start">
              {category
                ? category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                : "Category"}
            </h2>
          </div>
          <div className="col-12 col-lg-4 text-start text-lg-end order-1 order-lg-2 mb-2 mb-lg-0">
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

        {/* Dark break line */}
        <div className="row mb-3">
          <div className="col-12">
            <hr className="category-divider" />
          </div>
        </div>

        {/* Description Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="category-description mt-0 text-muted lh-lg text-start" style={{ fontSize: '1rem' }}>
              {description}
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