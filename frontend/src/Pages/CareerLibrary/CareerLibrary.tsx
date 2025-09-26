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
            <div className="container my-5  flex-grow-1">
                <h2>What are You Looking For ?</h2>
                <div className="cl-search-bar">
                    <input
                        type="text"
                        placeholder="Search for information on 200+ career options"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button>Search</button>
                </div>
                <span>Explore {careers.length} career options from {careerList.length} Career Categories.</span>


            </div>
            <Footer />
        </div>

    );
};

export default CareerLibrary;