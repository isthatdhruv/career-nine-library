import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

function AllCareers() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCareers() {
      setLoading(true);
      const savedUrlsSnap = await getDocs(collection(db, 'savedUrls'));
      const careersArr = [];
      savedUrlsSnap.forEach(doc => {
        careersArr.push({ id: doc.id, ...doc.data() });
      });
      setCareers(careersArr);
      setLoading(false);
    }
    fetchCareers();
  }, []);

// Helper to extract only the /careerlibrary/... path from the URL
function getCareerPath(url) {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/careerlibrary\/.*/);
      return match ? match[0] : u.pathname;
    } catch {
      return url;
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">All Career Library Entries</h2>
        <button className="btn btn-outline-primary" onClick={() => navigate('/')}>Home</button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : careers.length === 0 ? (
        <div className="text-muted">No careers found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Career ID</th>
                <th>Career Path</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {careers.map(career => (
                <tr key={career.id}>
                  <td>{career.id}</td>
                  <td>{getCareerPath(career.pageUrl)}</td>
                  <td>{career.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AllCareers;
