import React from "react";

const Section = () => {
  return (
    
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
  );
};

export default Section;
