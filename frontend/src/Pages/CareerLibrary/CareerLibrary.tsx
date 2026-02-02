import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import "./CareerLibrary.css";
import { db } from "../../firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import Section from "../../components/Section/Section.tsx";
import { useNavigate } from "react-router-dom"; // Add this import






const CareerLibrary = () => {
    const [careers, setCareers] = useState<string[]>([]);
    const [careerList, setCareerList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<'name' | 'popularity'>('name');
    const navigate = useNavigate(); // Initialize useNavigate
    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const mappingDoc = doc(collection(db, 'mappingSchema'), 'mapping');
                const mappingDocSnap = await getDoc(mappingDoc);
                localStorage.setItem('careerMapping', JSON.stringify(mappingDocSnap.data()));

                const data = mappingDocSnap.data();
                if (data) {

                    const careerKeys = Object.keys(data);
                    const careerValues = Object.values(data);


                    setCareers(careerKeys);

                    const tempList: string[] = [];
                    careerValues.forEach((categoryData: any) => {
                        if (categoryData && typeof categoryData === 'object') {
                            // Get the career names (keys) from each category, not the values
                            const careerNames = Object.keys(categoryData);
                            tempList.push(...careerNames);
                        }
                    });

                    setCareerList(tempList);
                    // console.log("Career List:", tempList);

                } else {
                    setCareers([]);
                }



            } catch (error) {
                console.error("Error fetching careers:", error);
            }
            // You can use mappingDocSnap.data() here
        };


        fetchCareers();
    }, []);

    const createSlug = (careerName: string): string => {
        return careerName
            .toLowerCase()

    };

    // Handle card click navigation
    const handleCardClick = (career: string) => {
        const slug = createSlug(career);
        navigate(`/${slug}`);
    };

    // Exclude the 'uncategorized' category from display
    const displayCareers = careers.filter(career => career.toLowerCase() !== 'uncategorized');

    const filteredCareers = displayCareers.filter(career =>
        career.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort careers
    const sortedCareers = [...filteredCareers].sort((a, b) => {
        if (sortBy === 'name') {
            return a.localeCompare(b);
        }
        // Add popularity sorting logic here if needed
        return 0;
    });

    return (
        <div className="container-fluid d-flex flex-column min-vh-100 p-0">
            <Header />
            <Section />
            <div className="career-search-section py-5">
                <div className="container text-center">
                    <h2 className="search-title mb-4">What career are you looking for?</h2>
                    <div className="row justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <div className="cl-search-bar d-flex">
                                <input
                                    type="text"
                                    placeholder="Search for information on 200+ career options"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <button className="search-button">Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container my-5 flex-grow-1">
                {/* Stats and Sort Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="career-stats">
                        Explore {careerList.length} career options from {displayCareers.length} Career Categories.
                    </span>
                    <div className="sort-options">
                        <span className="me-3">Sort By:</span>
                        <button
                            className={`btn btn-sm me-2 ${sortBy === 'name' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setSortBy('name')}
                        >
                            Name
                        </button>
                        <button
                            className={`btn btn-sm ${sortBy === 'popularity' ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setSortBy('popularity')}
                        >
                            Popularity
                        </button>
                    </div>
                </div>
                {/* Career Category Cards */}
                <div className="row g-4">
                    {sortedCareers.map((career, index) => (
                        <div key={index} className="col-12 col-sm-6 col-lg-4">
                            <div
                                className="card h-100 border-0 shadow-sm position-relative overflow-hidden career-card"
                                onClick={() => {
                                    handleCardClick(career);
                                }}
                                style={{
                                    cursor: 'pointer',
                                    minHeight: '250px'
                                    // Removed the inline background style - now handled by CSS class
                                }}
                            >
                                {/* Career Image */}
                                <img
                                    src={`/${career.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}.png`}
                                    className="card-img career-image"
                                    alt={career}
                                    onError={(e) => {
                                        // Hide image and show gradient background if image fails to load
                                        e.currentTarget.style.display = 'none';
                                    }}
                                    onLoad={(e) => {
                                        // Hide the placeholder icon when image loads successfully
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
                                            {career.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
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
                    ))}
                </div>

                {/* No results message */}
                {filteredCareers.length === 0 && searchTerm && (
                    <div className="text-center mt-5">
                        <div className="no-results">
                            <h4>No career categories found</h4>
                            <p>No results found for "{searchTerm}". Try a different search term.</p>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {careers.length === 0 && !searchTerm && (
                    <div className="text-center mt-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2">Loading career categories...</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>

    );
};

export default CareerLibrary;