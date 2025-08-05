import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import AllCareers from './Pages/AllCareers/AllCareers';
// import EditCareers from './Pages/CareerEdit/CareerEdit.tsx';
import EditCareers from './Pages/EditCareers/EditCareers';
import CareerLibrary from './Pages/CareerLibrary/CareerLibrary.tsx';
import ApiHealth from './Pages/ApiHealth/ApiHealth';
import PreviewPage from './Pages/previewPage/careerPreview.tsx';
function parseLinks(links) {
  // Parse links into a nested structure: domain > section > career
  const tree = {};
  links.forEach(link => {
    try {
      const url = new URL(link.pageUrl);
      const domain = "www.career-9.com";
      const pathParts = url.pathname.replace(/^\//, '').split('/');
      const section = pathParts[0] || 'root';
      const career = pathParts[1] || 'root';
      if (!tree[domain]) tree[domain] = {};
      if (!tree[domain][section]) tree[domain][section] = {};
      if (!tree[domain][section][career]) tree[domain][section][career] = [];
      tree[domain][section][career].push(link);
    } catch (e) {
      // skip invalid URLs
    }
  });
  return tree;
}

function MainApp() {
  const [links, setLinks] = useState([]); // savedUrls
  const [careerPagesMap, setCareerPagesMap] = useState({}); // urlDocId -> careerPageData
  const [tree, setTree] = useState({});
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [filteredPages, setFilteredPages] = useState([]);
  const [displayPage, setDisplayPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false); // Add caching flag
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      // Prevent multiple fetches if data is already loaded
      if (dataFetched) return;
      
      setLoading(true);
      
      try {
        // Fetch both collections in parallel to reduce database calls
        // Optional: Add limits if you have large datasets
        const savedUrlsQuery = query(
          collection(db, "savedUrls"),
          orderBy("timestamp", "desc")
          // limit(1000) // Uncomment if you want to limit results
        );
        
        const careerPagesQuery = query(
          collection(db, "careerPages"),
          orderBy("timestamp", "desc")
          // limit(1000) // Uncomment if you want to limit results
        );

        const [savedUrlsSnap, careerPagesSnap] = await Promise.all([
          getDocs(savedUrlsQuery),
          getDocs(careerPagesQuery)
        ]);

        // Process savedUrls
        const savedUrls = [];
        savedUrlsSnap.forEach((doc) => {
          savedUrls.push({ id: doc.id, ...doc.data() });
        });
        setLinks(savedUrls);
        setTree(parseLinks(savedUrls));

        // Process careerPages and map by docId
        const map = {};
        careerPagesSnap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...doc.data() };
        });
        setCareerPagesMap(map);
        setDataFetched(true); // Mark data as fetched
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [dataFetched]);

  useEffect(() => {
    if (
      selectedDomain &&
      selectedSection &&
      selectedCareer &&
      tree[selectedDomain] &&
      tree[selectedDomain][selectedSection] &&
      tree[selectedDomain][selectedSection][selectedCareer]
    ) {
      setFilteredPages(tree[selectedDomain][selectedSection][selectedCareer]);
    } else {
      setFilteredPages([]);
    }
    setSelectedPage('');
    setDisplayPage(null);
  }, [selectedDomain, selectedSection, selectedCareer, tree]);

  const totalCount = links.length;
  const filteredCount = filteredPages.length;

  // Dropdown options
  const domainOptions = Object.keys(tree);
  const sectionOptions = selectedDomain ? Object.keys(tree[selectedDomain]) : [];
  const careerOptions =
    selectedDomain && selectedSection
      ? Object.keys(tree[selectedDomain][selectedSection])
      : [];
  // For the page dropdown, show the career name (id) as label
  const pageOptions = filteredPages;

  // Fetch the actual page data from Firestore when a page is selected and search is clicked
  function handleSearch() {
    setLoading(true);
    if (!selectedPage) {
      // Show all pages under the selected career
      // filteredPages contains all savedUrls for the selected career
      // Map each to its corresponding careerPages data
      const allPages = filteredPages
        .map(page => careerPagesMap[page.id])
        .filter(Boolean);
      setDisplayPage(allPages.length > 0 ? allPages : null);
      setLoading(false);
      return;
    }
    // Show only the selected page
    const docId = selectedPage;
    const found = careerPagesMap[docId] || null;
    setDisplayPage(found ? [found] : null);
    setLoading(false);
  }

  // const navigate = useNavigate();
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Career Library</h2>
        <div>
          <span
            className="badge bg-primary me-2"
            style={{ cursor: 'pointer' }}
            title="View all careers"
            onClick={() => navigate('/all-careers')}
          >
            Total: {totalCount}
          </span>
          <span className="badge bg-success" onClick={() => navigate('/career-library')}>Filtered: {filteredCount}</span>
        </div>
      </div>
      <div className="row g-2 mb-3">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: '10px' }}>
        <button className="btn btn-info" onClick={() => navigate('/api-health')}>
          🏥 API Health
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/edit-careers')}>
          Edit Careers
        </button>
      </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedDomain}
            onChange={e => {
              setSelectedDomain(e.target.value);
              setSelectedSection('');
              setSelectedCareer('');
            }}
          >
            <option value="">Select Domain</option>
            {domainOptions.map(domain => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedSection}
            onChange={e => {
              setSelectedSection(e.target.value);
              setSelectedCareer('');
            }}
            disabled={!selectedDomain}
          >
            <option value="">Select Section</option>
            {sectionOptions.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedCareer}
            onChange={e => setSelectedCareer(e.target.value)}
            disabled={!selectedSection}
          >
            <option value="">Select Career</option>
            {careerOptions.map(career => (
              <option key={career} value={career}>{career}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedPage}
            onChange={e => setSelectedPage(e.target.value)}
            disabled={filteredPages.length === 0}
          >
            <option value="">Select Page</option>
            {pageOptions.map(page => {
              // Use the id (career name) as label, fallback to pageUrl if not present
              let label = page.id;
              if (!label && page.pageUrl) {
                try {
                  const url = new URL(page.pageUrl);
                  const pathParts = url.pathname.split('/').filter(Boolean);
                  label = pathParts[pathParts.length - 1] || page.pageUrl;
                } catch {
                  label = page.pageUrl;
                }
              }
              return (
                <option key={page.id} value={page.id}>{label}</option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          // Allow search even if no page is selected (to show all pages under career)
        >
          Search
        </button>
      </div>
      <div>
        {loading && <div>Loading...</div>}
        {!loading && displayPage && Array.isArray(displayPage) && displayPage.length > 0 && (
          displayPage.map((page, idx) => (
            <div className="card mt-4" key={page.id || idx}>
              <div className="card-body">
                <h4 className="mb-2">{page.title}</h4>
                <p><strong>Summary:</strong> {page.summary}</p>
                {page["career-opportunities"] && (
                  <div className="mb-2">
                    <strong>Career Opportunities:</strong>
                    <ul>
                      {Object.entries(page["career-opportunities"]).map(([key, value]) => (
                        <li key={key}><strong>{key.replace(/-/g, ' ')}:</strong> {value}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {page["how to become"] && (
                  <div className="mb-2">
                    <strong>How to Become:</strong>
                    <ul>
                      {Object.entries(page["how to become"]).map(([path, obj]) => (
                        <li key={path}>
                          <strong>{path}:</strong> Stream: {obj.stream || '-'}, Graduation: {obj.graduation || '-'}, After Graduation: {obj["after graduation"] || '-'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {page["Important Facts"] && page["Important Facts"].trim() && (
                  <p><strong>Important Facts:</strong> {page["Important Facts"]}</p>
                )}
                {page["leading institutes"] && (
                  <div className="mb-2">
                    <strong>Leading Institutes:</strong>
                    <ul>
                      {Object.entries(page["leading institutes"]).map(([idx, inst]) => (
                        inst.name ? (
                          <li key={idx}>
                            <strong>{inst.name}</strong> ({inst.location}) {inst.website && (<a href={inst.website} target="_blank" rel="noopener noreferrer">[Website]</a>)}
                          </li>
                        ) : null
                      ))}
                    </ul>
                  </div>
                )}
                {page["entrance exam"] && Array.isArray(page["entrance exam"]) && page["entrance exam"].length > 0 && (
                  <div className="mb-2">
                    <strong>Entrance Exams:</strong>
                    <ul>
                      {page["entrance exam"].map((exam, idx) => (
                        <li key={idx}>
                          <strong>{exam.name}</strong>
                          {exam.date && <> | <strong>Date:</strong> {exam.date}</>}
                          {exam.elements && <> | <strong>Elements:</strong> {exam.elements}</>}
                          {exam.website && (
                            <> | <a href={exam.website.startsWith('http') ? exam.website : `https://${exam.website}`} target="_blank" rel="noopener noreferrer">Website</a></>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {page["work description"] && page["work description"].length > 0 && (
                  <div className="mb-2">
                    <strong>Work Description:</strong>
                    <ul>
                      {page["work description"].map((desc, idx) => (
                        <li key={idx}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {page["pros and cons"] && (
                  <div className="mb-2">
                    <strong>Pros:</strong>
                    <ul>
                      {page["pros and cons"].pros && page["pros and cons"].pros.map((pro, idx) => (
                        <li key={"pro-"+idx}>{pro}</li>
                      ))}
                    </ul>
                    <strong>Cons:</strong>
                    <ul>
                      {page["pros and cons"].cons && page["pros and cons"].cons.map((con, idx) => (
                        <li key={"con-"+idx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* <div className="text-muted small mt-2">Source: <a href={page.pageUrl} target="_blank" rel="noopener noreferrer">{page.pageUrl}</a></div> */}
                <div className="text-muted small">Timestamp: {page.timestamp}</div>
              </div>
            </div>
          ))
        )}
        {!loading && (!displayPage || (Array.isArray(displayPage) && displayPage.length === 0)) && <div className="text-muted">No page selected. Please select and search.</div>}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/all-careers" element={<AllCareers />} />
        <Route path="/edit-careers" element={<EditCareers />} />
        <Route path="/career-library" element={<CareerLibrary />} />
        <Route path="/api-health" element={<ApiHealth />} />
        <Route path="/preview-career" element={<PreviewPage />} />
        <Route path="/preview-career/:slug" element={<PreviewPage />} />
      </Routes>
    </Router>
  );
}

export default App;
