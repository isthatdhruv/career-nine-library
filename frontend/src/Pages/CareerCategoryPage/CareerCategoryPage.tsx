import React, { useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import Section from "../../components/Section/Section.tsx";
import "./CareerCategoryPage.css";
import { useNavigate, useParams } from "react-router";
import { doc, collection, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";

const CareerCategoryPage = () => {
  const { category } = useParams<{ category?: string }>();
  const [description, setDescription] = React.useState<string>("");
  const [careerValues, setCareerValues] = React.useState<any[]>([]);
  const [careerImages, setCareerImages] = React.useState<{ [key: string]: string }>({});
  const [imagesLoading, setImagesLoading] = React.useState(false); // Add loading state

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMapping = async () => {
      try {
        const temp = doc(collection(db, 'categoryDescription'), 'description');
        const DescriptionSnap = await getDoc(temp);
        const descriptionData = DescriptionSnap.data();
        const desc = descriptionData ? descriptionData[category as string] : "Description not available.";
        setDescription(desc);

        const mappingDoc = doc(collection(db, 'mappingSchema'), 'mapping');
        const mappingDocSnap = await getDoc(mappingDoc);
        const data = mappingDocSnap.data();
        // console.log("Mapping data:", data);

        if (data) {
          const categoryData = data[category as string];
          console.log("Category data:", categoryData);
          if (categoryData && typeof categoryData === 'object') {
            const careerNames = Object.keys(categoryData);
            setCareerValues(careerNames);
          } else {
            setCareerValues([]);
          }
        } else {
          setCareerValues([]);
        }
      } catch (error) {
        console.error("Error fetching mapping data:", error);
        setCareerValues([]);
      }
    };

    if (category) {
      fetchMapping();
    }
  }, [category]);

  useEffect(() => {
    if (careerValues.length > 0) {
      setImagesLoading(true); // Start loading
      fetchCareerImages(careerValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerValues]);

  const fetchCareerImages = async (careerNames: string[]) => {
    const imageMap: { [key: string]: string } = {};
    const imagePromises = careerValues.map(async (careerValue) => {
      try {
        const careerDoc = doc(collection(db, 'careerPages'), careerValue);
        const careerSnap = await getDoc(careerDoc);
        const careerData = careerSnap.data();

        if (careerData && careerData.bannerImage) {
          imageMap[careerValue] = careerData.bannerImage;
        } else {
          imageMap[careerValue] = '/images/default-career.png';
        }
      } catch (error) {
        console.error(`Error fetching image for ${careerValue}:`, error);
        imageMap[careerValue] = '/images/default-career.png';
      }
    });

    await Promise.all(imagePromises);
    setCareerImages(imageMap);
    setImagesLoading(false); // End loading
  };

  const handleCardClick = (careerValue: string) => {
    console.log("Selected Career Value:", careerValue);
    // Navigate with category as URL parameter
    navigate(`/career/${careerValue}?from=${category}`);
  };

  const sortedCareerValues = [...careerValues].sort((a, b) => {
    return a.localeCompare(b);
  });


  const formatCategoryName = (categorySlug: string) => {
    return categorySlug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };
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
                ? formatCategoryName(category)
                : "Category"}
            </h2>
          </div>
          {/* <div className="col-12 col-lg-4 text-start text-lg-end order-1 order-lg-2 mb-2 mb-lg-0">
            
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary dropdown-toggle px-4"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ minWidth: '200px' }}
                disabled={categoriesLoading}
              >
                {categoriesLoading ? 'Loading...' : 'Choose another Career'}
              </button>
              <ul className="dropdown-menu w-100">
                {categoriesLoading ? (
                  <li className="dropdown-item-text text-center py-3">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <span className="ms-2">Loading categories...</span>
                  </li>
                ) : allCategories.length === 0 ? (
                  <li className="dropdown-item-text text-center text-muted">
                    No categories available
                  </li>
                ) : (
                  allCategories
                    .filter(cat => cat !== category) // Filter out current category
                    .sort((a, b) => formatCategoryName(a).localeCompare(formatCategoryName(b))) // Sort alphabetically
                    .map((categorySlug, index) => (
                      <li key={index}>
                        <button
                          className="dropdown-item"
                          onClick={() => handleCategoryChange(categorySlug)}
                        >
                          {formatCategoryName(categorySlug)}
                        </button>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div> */}
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
        <div className="row g-4" style={{ minHeight: '300px' }}>
          {imagesLoading ? (
            // Loading State
            <div className="col-12 d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-muted">Loading career options...</h5>
                <p className="text-muted mb-0">Please wait while we fetch the latest career information.</p>
              </div>
            </div>
          ) : careerValues.length === 0 ? (
            // No Data State
            <div className="col-12 d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <div className="text-center">
                <i className="bi bi-exclamation-circle text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h5 className="text-muted">No career options found</h5>
                <p className="text-muted mb-0">No careers available for this category at the moment.</p>
              </div>
            </div>
          ) : (
            // Career Cards
            sortedCareerValues.map((careerValue, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-4">
                <div
                  className="card h-100 border-0 shadow-sm position-relative overflow-hidden career-card"
                  onClick={() => {
                    handleCardClick(careerValue);
                  }}
                  style={{
                    cursor: 'pointer',
                    minHeight: '250px'
                  }}
                >
                  {/* Career Image */}
                  <img
                    src={careerImages[careerValue] || '/images/default-career.png'}
                    className="card-img career-image"
                    alt={careerValue}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      const placeholderIcon = e.currentTarget.parentElement?.querySelector('.placeholder-icon');
                      if (placeholderIcon) {
                        (placeholderIcon as HTMLElement).style.display = 'none';
                      }
                    }}
                  />

                  <div className="card-img-overlay d-flex align-items-end p-0">
                    <div className="w-100 text-center p-4" style={{
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                    }}>
                      <h5 className="card-title text-white fw-bold mb-0">
                        {careerValue
                          .replace(/as a career in india/gi, '')
                          .replace(/-/g, ' ')
                          .replace(/_/g, ' ')
                          .trim()
                          .replace(/\b\w/g, (c: string) => c.toUpperCase())
                        }
                      </h5>
                    </div>
                  </div>

                  {/* Placeholder Icon - shown when no image */}
                  <div className="position-absolute top-50 start-50 translate-middle placeholder-icon">
                    <i className="bi bi-briefcase" style={{
                      fontSize: '4rem',
                      color: 'rgba(255,255,255,0.3)'
                    }}></i>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareerCategoryPage;