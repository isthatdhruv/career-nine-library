import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import "./CareerLibrary.css";
import { db } from "../../firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import Section from "../../components/Section/Section.tsx";
import { useNavigate } from "react-router-dom";

const CareerLibrary = () => {
    const [careers, setCareers] = useState<string[]>([]);
    const [careerList, setCareerList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<'name' | 'popularity'>('name');
    const navigate = useNavigate();

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
                            const careerNames = Object.keys(categoryData);
                            tempList.push(...careerNames);
                        }
                    });

                    setCareerList(tempList);
                } else {
                    setCareers([]);
                }
            } catch (error) {
                console.error("Error fetching careers:", error);
            }
        };

        fetchCareers();
    }, []);

    const createSlug = (careerName: string): string => {
        return careerName.toLowerCase();
    };

    const handleCardClick = (career: string) => {
        const slug = createSlug(career);
        navigate(`/${slug}`);
    };

    const displayCareers = careers.filter(career => career.toLowerCase() !== 'uncategorized');

    const filteredCareers = displayCareers.filter(career =>
        career.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedCareers = [...filteredCareers].sort((a, b) => {
        if (sortBy === 'name') {
            return a.localeCompare(b);
        }
        return 0;
    });

    return (
        <div className="container-fluid d-flex flex-column min-vh-100 p-0">
            <Header />
            <Section />

            {/* Search Section */}
            <div className="career-search-section py-4 py-md-5">
                <div className="container text-center px-3">
                    <h2 className="search-title mb-3 mb-md-4">What career are you looking for?</h2>
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-8 col-lg-6">
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

            <div className="container my-3 my-md-5 flex-grow-1 px-3">
                {/* Stats and Sort Section */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 mb-md-4 gap-2">
                    <span className="career-stats" style={{ fontSize: 'clamp(0.8rem, 2vw, 1rem)' }}>
                        Explore {careerList.length} career options from {displayCareers.length} Career Categories.
                    </span>
                    <div className="sort-options d-flex align-items-center flex-shrink-0">
                        <span className="me-2" style={{ fontSize: '0.9rem' }}>Sort By:</span>
                        <button
                            className={`btn btn-sm me-1 ${sortBy === 'name' ? 'btn-success' : 'btn-outline-success'}`}
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
                <div className="row g-3 g-md-4">
                    {sortedCareers.map((career, index) => (
                        <div key={index} className="col-6 col-md-4 col-lg-4">
                            <div
                                className="card h-100 border-0 shadow-sm position-relative overflow-hidden career-card"
                                onClick={() => handleCardClick(career)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Career Image */}
                                <img
                                    src={`/${career.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}.png`}
                                    className="card-img career-image"
                                    alt={career}
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
                                    <div className="w-100 text-center p-2 p-md-4" style={{
                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                                    }}>
                                        <h5 className="card-title text-white fw-bold mb-0" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1.1rem)' }}>
                                            {career.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </h5>
                                    </div>
                                </div>

                                {/* Placeholder Icon */}
                                <div className="position-absolute top-50 start-50 translate-middle placeholder-icon">
                                    <i className="bi bi-briefcase" style={{
                                        fontSize: '3rem',
                                        color: 'rgba(255,255,255,0.3)'
                                    }}></i>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No results message */}
                {filteredCareers.length === 0 && searchTerm && (
                    <div className="text-center mt-4">
                        <div className="no-results">
                            <h4>No career categories found</h4>
                            <p>No results found for "{searchTerm}". Try a different search term.</p>
                        </div>
                    </div>
                )}

                {/* Loading state */}
                {careers.length === 0 && !searchTerm && (
                    <div className="text-center mt-4">
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
