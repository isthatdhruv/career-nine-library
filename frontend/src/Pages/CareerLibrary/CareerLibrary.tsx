import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer";
import "./CareerLibrary.css";
import { db } from "../../firebase";
import { collection, doc, getDoc } from "firebase/firestore";







const CareerLibrary = () => {
    const [careers, setCareers] = useState<string[]>([]);
    const [careerDetails, setCareerDetails] = useState<{ [key: string]: any }>({});
    const [careerList, setCareerList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<'name' | 'popularity'>('name');

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const mappingDoc = doc(collection(db, 'mappingSchema'), 'mapping');
                const mappingDocSnap = await getDoc(mappingDoc);

                const data = mappingDocSnap.data();
                if (data) {
                    
                    const careerKeys = Object.keys(data);
                    const careerValues = Object.values(data);

                    setCareerDetails(careerValues);
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


    const filteredCareers = careers.filter(career =>
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
            <section
                className="cl-banner d-flex align-items-center justify-content-center"
                style={{
                    backgroundImage: 'url("./banner.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    minHeight: '400px',
                    position: 'relative'
                }}
            >
                <div
                    className="position-absolute w-100 h-100"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        top: 0,
                        left: 0
                    }}
                ></div>
                <div className="cl-banner-content text-center position-relative" style={{ zIndex: 2 }}>
                    <h1
                        className="career-library-title text-white display-4 fw-bold"
                        style={{
                            color: '#ffffff !important',
                            background: 'transparent !important',
                            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                        }}
                    >
                        Career Library
                    </h1>
                </div>
            </section>
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
                        Explore {careerList.length} career options from {careers.length} Career Categories.
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
                                    console.log(`Navigate to ${career} category`);
                                }}
                                style={{ 
                                    cursor: 'pointer',
                                    minHeight: '250px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                <div className="card-img-overlay d-flex align-items-end p-0">
                                    <div className="w-100 text-center p-4" style={{
                                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                                    }}>
                                        <h5 className="card-title text-white fw-bold mb-0">
                                            {career}
                                        </h5>
                                    </div>
                                </div>
                                
                                {/* Placeholder Icon */}
                                <div className="position-absolute top-50 start-50 translate-middle">
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