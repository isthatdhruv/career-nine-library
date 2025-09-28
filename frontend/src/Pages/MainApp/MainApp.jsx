import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function parseLinks(links) {
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
    } catch (e) {}
  });
  return tree;
}

const MainApp = () => {
  const [links, setLinks] = useState([]);
  const [careerPagesMap, setCareerPagesMap] = useState({});
  const [tree, setTree] = useState({});
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedPage, setSelectedPage] = useState('');
  const [filteredPages, setFilteredPages] = useState([]);
  const [displayPage, setDisplayPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (dataFetched) return;
      setLoading(true);
      try {
        const savedUrlsQuery = query(collection(db, "savedUrls"), orderBy("timestamp", "desc"));
        const careerPagesQuery = query(collection(db, "careerPages"), orderBy("timestamp", "desc"));
        const [savedUrlsSnap, careerPagesSnap] = await Promise.all([
          getDocs(savedUrlsQuery),
          getDocs(careerPagesQuery)
        ]);

        const savedUrls = savedUrlsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLinks(savedUrls);
        setTree(parseLinks(savedUrls));

        const map = {};
        careerPagesSnap.forEach(doc => {
          map[doc.id] = { id: doc.id, ...doc.data() };
        });
        setCareerPagesMap(map);
        setDataFetched(true);
      } catch (err) {
        console.error('Error fetching data:', err);
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
      tree[selectedDomain]?.[selectedSection]?.[selectedCareer]
    ) {
      setFilteredPages(tree[selectedDomain][selectedSection][selectedCareer]);
    } else {
      setFilteredPages([]);
    }
    setSelectedPage('');
    setDisplayPage(null);
  }, [selectedDomain, selectedSection, selectedCareer, tree]);

  const handleSearch = () => {
    setLoading(true);
    if (!selectedPage) {
      const allPages = filteredPages.map(p => careerPagesMap[p.id]).filter(Boolean);
      setDisplayPage(allPages.length > 0 ? allPages : null);
      setLoading(false);
      return;
    }
    const found = careerPagesMap[selectedPage] || null;
    setDisplayPage(found ? [found] : null);
    setLoading(false);
  };

  const domainOptions = Object.keys(tree);
  const sectionOptions = selectedDomain ? Object.keys(tree[selectedDomain]) : [];
  const careerOptions = selectedDomain && selectedSection ? Object.keys(tree[selectedDomain][selectedSection]) : [];
  const pageOptions = filteredPages;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Career Library</h2>
        <div>
          <span className="badge bg-primary me-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/all-careers')}>
            Total: {links.length}
          </span>
          <span className="badge bg-success" onClick={() => navigate('/career-library')}>
            Filtered: {filteredPages.length}
          </span>
        </div>
      </div>
      {/* Dropdowns */}
      <div className="row g-2 mb-3">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: '10px' }}>
          <button className="btn btn-info" onClick={() => navigate('/api-health')}>🏥 API Health</button>
          <button className="btn btn-primary" onClick={() => navigate('/edit-careers')}>Edit Careers</button>
          <button className="btn btn-secondary" onClick={() => navigate('/table-page')}>📊 Table Mapping</button>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={selectedDomain} onChange={e => { setSelectedDomain(e.target.value); setSelectedSection(''); setSelectedCareer(''); }}>
            <option value="">Select Domain</option>
            {domainOptions.map(domain => <option key={domain} value={domain}>{domain}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setSelectedCareer(''); }} disabled={!selectedDomain}>
            <option value="">Select Section</option>
            {sectionOptions.map(section => <option key={section} value={section}>{section}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={selectedCareer} onChange={e => setSelectedCareer(e.target.value)} disabled={!selectedSection}>
            <option value="">Select Career</option>
            {careerOptions.map(career => <option key={career} value={career}>{career}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={selectedPage} onChange={e => setSelectedPage(e.target.value)} disabled={filteredPages.length === 0}>
            <option value="">Select Page</option>
            {pageOptions.map(page => <option key={page.id} value={page.id}>{page.id}</option>)}
          </select>
        </div>
        <div className="mb-3" style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>
        {loading && <div>Loading...</div>}
        {!loading && displayPage && displayPage.map((page, idx) => (
          <div className="card mt-4" key={page.id || idx}>
            <div className="card-body">
              <h4 className="mb-2">{page.title}</h4>
              <p><strong>Summary:</strong> {page.summary}</p>
              <div className="text-muted small">Timestamp: {page.timestamp}</div>
            </div>
          </div>
        ))}
        {!loading && (!displayPage || displayPage.length === 0) && <div className="text-muted">No page selected. Please select and search.</div>}
      </div>
    </div>
  );
};

export default MainApp;