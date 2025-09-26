import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import './careerPreview.css';

// Enhanced types for better data mapping
interface CareerOpportunity {
  title?: string;
  description?: string;
  subItems?: CareerOpportunity[];
}

interface CareerPath {
  pathName: string;
  stream: string;
  graduation: string;
  afterGraduation: string;
  afterPostGraduation?: string;
}

interface Institute {
  name: string;
  location: string;
  website: string;
}

interface EntranceExam {
  name?: string;
  college?: string;
  date: string;
  elements: string;
  website: string;
}

interface HowToBecomeItem {
  stream: string;
  graduation: string;
  'after graduation': string;
  'after post graduation'?: string;
}

interface ProsAndCons {
  pros: string[];
  cons: string[];
}

// Flexible interface to handle your database structure
interface CareerData {
  id?: string;
  title?: string;
  summary?: string;
  summaryImageUrl?: string;
  bannerImage?: string;
  'career-opportunities'?: Record<string, any>;
  'how to become'?: Record<string, HowToBecomeItem>;
  'Important Facts'?: string;
  'leading institutes'?: Record<string, Institute>;
  'institutions abroad'?: Record<string, Institute>;
  'entrance exam'?: EntranceExam[];
  'work description'?: string[];
  'pros and cons'?: ProsAndCons;
  pageUrl?: string;
  timestamp?: string;
  isTemporary?: boolean;
  originalId?: string;
  createdAt?: string;
}

interface CareerPreviewProps {
  careerData?: CareerData;
  careerSlug?: string;
}

const CareerPreview: React.FC<CareerPreviewProps> = ({ 
  careerData: propCareerData, 
  careerSlug 
}) => {
  const [careerData, setCareerData] = useState<CareerData | null>(propCareerData || null);
  const [loading, setLoading] = useState<boolean>(!propCareerData);
  const [error, setError] = useState<string | null>(null);
  const [availableCareers, setAvailableCareers] = useState<Array<{id: string, title: string}>>([]);
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const currentSlug = careerSlug || slug;

  // Fetch available careers for dropdown
  useEffect(() => {
    const fetchAvailableCareers = async () => {
      try {
        const careerPagesSnap = await getDocs(collection(db, 'careerPages'));
        const careers: Array<{id: string, title: string}> = [];
        careerPagesSnap.forEach(doc => {
          const data = doc.data();
          careers.push({ 
            id: doc.id, 
            title: data.title || doc.id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          });
        });
        setAvailableCareers(careers.sort((a, b) => a.title.localeCompare(b.title)));
      } catch (err) {
        console.error('Error fetching careers:', err);
      }
    };

    fetchAvailableCareers();
  }, []);

  // Fetch career data if not provided as prop
  useEffect(() => {
    if (!propCareerData && currentSlug) {
      const fetchCareerData = async () => {
        setLoading(true);
        setError(null);
        
        try {
          // Check URL parameters to see if this is a temporary preview
          const urlParams = new URLSearchParams(window.location.search);
          const isTemp = urlParams.get('temp') === 'true';
          
          if (isTemp) {
            // Fetch from temporary collection
            const tempDocRef = doc(db, 'tempPreviewPages', currentSlug);
            const tempDocSnap = await getDoc(tempDocRef);
            
            if (tempDocSnap.exists()) {
              const tempData = { id: tempDocSnap.id, ...tempDocSnap.data() } as CareerData;
              console.log('Using temporary preview data:', tempData);
              setCareerData(tempData);
              setLoading(false);
              return;
            } else {
              console.warn('Temporary document not found, falling back to main collection');
            }
          }
          
          // First check if we have preview data from editing session (fallback)
          const previewData = sessionStorage.getItem('previewCareerData');
          if (previewData) {
            const parsedData = JSON.parse(previewData);
            console.log('Using preview data from EditCareers:', parsedData);
            setCareerData(parsedData as CareerData);
            setLoading(false);
            // Clear the session storage after using it
            sessionStorage.removeItem('previewCareerData');
            return;
          }

          // If no preview data, fetch from Firebase main collection
          const docRef = doc(db, 'careerPages', currentSlug);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setCareerData({ id: docSnap.id, ...docSnap.data() } as CareerData);
          } else {
            setError('Career not found');
          }
        } catch (err) {
          console.error('Error fetching career data:', err);
          setError('Failed to load career data');
        } finally {
          setLoading(false);
        }
      };

      fetchCareerData();
    }
  }, [currentSlug, propCareerData]);

  // Handle career selection from dropdown
  const handleCareerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      navigate(`/preview-career/${selectedId}`);
    }
  };

  // Helper functions to process the data
  const processCareerOpportunities = (opportunities: Record<string, any>): CareerOpportunity[] => {
    if (!opportunities) return [];
    
    return Object.entries(opportunities).map(([key, value]) => {
      if (typeof value === 'string') {
        return {
          title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: value
        };
      } else if (typeof value === 'object' && value.description) {
        return {
          title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: value.description,
          subItems: value.subItems || []
        };
      }
      return {
        title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: ''
      };
    });
  };

  const processCareerPaths = (howToBecome: Record<string, HowToBecomeItem>): CareerPath[] => {
    if (!howToBecome) return [];
    
    return Object.entries(howToBecome).map(([pathName, pathData]) => ({
      pathName: pathName.replace(/path \d+/i, '').trim() || pathName,
      stream: pathData.stream || '',
      graduation: pathData.graduation || '',
      afterGraduation: pathData['after graduation'] || '',
      afterPostGraduation: pathData['after post graduation'] || ''
    }));
  };

  const processInstitutes = (institutes: Record<string, Institute>): Institute[] => {
    if (!institutes) return [];
    
    return Object.values(institutes).filter(institute => 
      institute && typeof institute === 'object' && institute.name
    );
  };

  const processImportantFacts = (facts: string): string[] => {
    if (!facts) return [];
    
    // Split by common delimiters and filter out empty strings
    return facts.split(/[.!?]+/)
      .map(fact => fact.trim())
      .filter(fact => fact.length > 0)
      .map(fact => fact.endsWith('.') ? fact : fact + '.');
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !careerData) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error || 'Career data not available'}</p>
        </div>
      </div>
    );
  }

  // Process the data - careerData is guaranteed to be non-null here
  const careerOpportunities = processCareerOpportunities(careerData['career-opportunities'] || {});
  const careerPaths = processCareerPaths(careerData['how to become'] || {});
  const leadingInstitutes = processInstitutes(careerData['leading institutes'] || {});
  const institutionsAbroad = processInstitutes(careerData['institutions abroad'] || {});
  const entranceExams = careerData['entrance exam'] || [];
  const workDescription = careerData['work description'] || [];
  const importantFacts = processImportantFacts(careerData['Important Facts'] || '');
  const prosAndCons = careerData['pros and cons'] || { pros: [], cons: [] };

  // Check if this is a temporary preview
  const urlParams = new URLSearchParams(window.location.search);
  const isTemporaryPreview = urlParams.get('temp') === 'true' || careerData?.isTemporary;

  const displayTitle = careerData.title || currentSlug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Career Preview';
  const displayImage = careerData.bannerImage || careerData.summaryImageUrl || `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(displayTitle)}`;

  return (
    <div className="container py-4">
      {/* Breadcrumb & Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <span className="text-muted">Home</span>
            </li>
            <li className="breadcrumb-item">
              <span className="text-muted">Career Library</span>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {displayTitle}
            </li>
          </ol>
        </nav>
        <div className="d-flex gap-2">
          {/* Back to Edit Button */}
          <button 
            className="btn btn-outline-primary"
            onClick={() => navigate('/edit-careers', { 
              state: { 
                selectedCareer: currentSlug,
                fromPreview: true,
                isTemporaryPreview: isTemporaryPreview,
                originalId: careerData?.originalId || currentSlug
              } 
            })}
            title="Go back to edit this career page"
          >
            ✏️ Back to Edit
          </button>
          {/* Career Selection Dropdown */}
          <select 
            className="form-select w-auto" 
            value={currentSlug || ''} 
            onChange={handleCareerChange}
          >
            <option value="">Choose another Career</option>
            {availableCareers.map(career => (
              <option key={career.id} value={career.id}>
                {career.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        {/* Sidebar Navigation */}
        <aside className="col-12 col-md-3 mb-4">
          <ul className="nav flex-column nav-pills">
            <li className="nav-item"><a className="nav-link" href="#summary">Summary</a></li>
            {careerOpportunities.length > 0 && (
              <li className="nav-item"><a className="nav-link" href="#professional-opportunities">Professional Opportunities</a></li>
            )}
            {careerPaths.length > 0 && (
              <li className="nav-item"><a className="nav-link" href="#career-path">Career Path</a></li>
            )}
            {importantFacts.length > 0 && (
              <li className="nav-item"><a className="nav-link" href="#important-facts">Important Facts</a></li>
            )}
            {leadingInstitutes.length > 0 && (
              <li className="nav-item"><a className="nav-link" href="#leading-institutes">Leading Institutes</a></li>
            )}
            {institutionsAbroad.length > 0 && (
              <li className="nav-item"><a className="nav-link" href="#institutions-abroad">Institutions Abroad</a></li>
            )}
            {entranceExams.length > 0 && (
              <li className="nav-item"><a className="nav-link" href="#entrance-exams">Entrance Exams</a></li>
            )}
            {workDescription.length > 0 && (
              <li className="nav-item"><a className="nav-link" href="#work-description">Work Description</a></li>
            )}
            {(prosAndCons.pros.length > 0 || prosAndCons.cons.length > 0) && (
              <li className="nav-item"><a className="nav-link" href="#pros-cons">Pros & Cons</a></li>
            )}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="col-12 col-md-9">
          {/* Summary Section */}
          <section id="summary" className="mb-5">
            <div className="d-flex align-items-center gap-3 mb-3">
              <h1 className="mb-0">{displayTitle}</h1>
              {isTemporaryPreview && (
                <span 
                  className="badge bg-warning text-dark px-3 py-2"
                  style={{ 
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  📝 Preview Mode - Unsaved Changes
                </span>
              )}
            </div>
            <div className="row align-items-center">
              <div className="col-md-8">
                <p>{careerData.summary || 'No summary available for this career.'}</p>
              </div>
              <div className="col-md-4 text-center">
                <img 
                  src={displayImage} 
                  alt={`${displayTitle} Illustration`} 
                  className="img-fluid"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/400x300/6366f1/FFFFFF?text=${encodeURIComponent(displayTitle)}`;
                  }}
                />
              </div>
            </div>
          </section>

          {/* Career Opportunities Accordion */}
          {careerOpportunities.length > 0 && (
            <section id="professional-opportunities" className="mb-5">
              <h2 className="mb-3">Career Opportunities in {displayTitle}</h2>
              <div className="accordion" id="opportunitiesAccordion">
                {careerOpportunities.map((opportunity, idx) => (
                  <div className="accordion-item" key={opportunity.title || idx}>
                    <h2 className="accordion-header" id={`heading${idx}`}> 
                      <button 
                        className={`accordion-button ${expandedAccordion === idx ? '' : 'collapsed'}`}
                        type="button" 
                        onClick={() => setExpandedAccordion(expandedAccordion === idx ? null : idx)}
                        aria-expanded={expandedAccordion === idx}
                        aria-controls={`collapse${idx}`}
                      >
                        {opportunity.title}
                      </button>
                    </h2>
                    <div 
                      id={`collapse${idx}`} 
                      className={`accordion-collapse collapse ${expandedAccordion === idx ? 'show' : ''}`}
                      aria-labelledby={`heading${idx}`} 
                      data-bs-parent="#opportunitiesAccordion"
                    >
                      <div className="accordion-body">
                        {opportunity.description && <p>{opportunity.description}</p>}
                        {opportunity.subItems && opportunity.subItems.map((subItem, subIdx) => (
                          <div key={subItem.title || subIdx} className="ms-3 mb-2">
                            <h6 className="fw-bold">{subItem.title}</h6>
                            {subItem.description && <p className="mb-1">{subItem.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Career Path Table */}
          {careerPaths.length > 0 && (
            <section id="career-path" className="mb-5">
              <h2 className="mb-3">How to Pursue a Career in {displayTitle}</h2>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Path</th>
                      <th>Stream</th>
                      <th>Graduation</th>
                      <th>After Graduation</th>
                      <th>After Post Graduation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {careerPaths.map((path, idx) => (
                      <tr key={path.pathName || idx}>
                        <td>{path.pathName}</td>
                        <td>{path.stream}</td>
                        <td>{path.graduation}</td>
                        <td>{path.afterGraduation}</td>
                        <td>{path.afterPostGraduation || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Important Facts */}
          {importantFacts.length > 0 && (
            <section id="important-facts" className="mb-5">
              <h3>Important Facts</h3>
              <ul className="list-group list-group-flush">
                {importantFacts.map((fact, idx) => (
                  <li key={idx} className="list-group-item">{fact}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Leading Institutes */}
          {leadingInstitutes.length > 0 && (
            <section id="leading-institutes" className="mb-5">
              <h3 className="mb-3">Top Institutes in India</h3>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>College</th>
                      <th>Location</th>
                      <th>Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadingInstitutes.map((institute, idx) => (
                      <tr key={institute.name || idx}>
                        <td>{institute.name}</td>
                        <td>{institute.location}</td>
                        <td>
                          {institute.website ? (
                            <a href={institute.website} target="_blank" rel="noopener noreferrer">
                              Visit
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Institutions Abroad */}
          {institutionsAbroad.length > 0 && (
            <section id="institutions-abroad" className="mb-5">
              <h3 className="mb-3">Top Institutes Worldwide</h3>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>College</th>
                      <th>Location</th>
                      <th>Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutionsAbroad.map((institute, idx) => (
                      <tr key={institute.name || idx}>
                        <td>{institute.name}</td>
                        <td>{institute.location}</td>
                        <td>
                          {institute.website ? (
                            <a href={institute.website} target="_blank" rel="noopener noreferrer">
                              Visit
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Entrance Exams */}
          {entranceExams.length > 0 && (
            <section id="entrance-exams" className="mb-5">
              <h3 className="mb-3">Entrance Exams</h3>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-light">
                    <tr>
                      <th>Exam Name</th>
                      <th>Date</th>
                      <th>Elements</th>
                      <th>Website</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entranceExams.map((exam, idx) => (
                      <tr key={exam.name || exam.college || idx}>
                        <td>{exam.name || exam.college || 'N/A'}</td>
                        <td>{exam.date}</td>
                        <td>{exam.elements}</td>
                        <td>
                          {exam.website ? (
                            <a href={exam.website} target="_blank" rel="noopener noreferrer">
                              Visit
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Work Description */}
          {workDescription.length > 0 && (
            <section id="work-description" className="mb-5">
              <h3>Work Description</h3>
              <ul className="list-group">
                {workDescription.map((item, idx) => (
                  <li key={idx} className="list-group-item">{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Pros & Cons */}
          {(prosAndCons.pros.length > 0 || prosAndCons.cons.length > 0) && (
            <section id="pros-cons" className="mb-5">
              <h3 className="mb-3">Pros & Cons</h3>
              <div className="row">
                {prosAndCons.pros.length > 0 && (
                  <div className="col-md-6">
                    <h5 className="text-success">Pros</h5>
                    <ul className="list-unstyled">
                      {prosAndCons.pros.map((pro, idx) => (
                        <li key={idx} className="mb-2">
                          <i className="text-success me-2">✓</i>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {prosAndCons.cons.length > 0 && (
                  <div className="col-md-6">
                    <h5 className="text-danger">Cons</h5>
                    <ul className="list-unstyled">
                      {prosAndCons.cons.map((con, idx) => (
                        <li key={idx} className="mb-2">
                          <i className="text-danger me-2">✗</i>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
};

export default CareerPreview;
