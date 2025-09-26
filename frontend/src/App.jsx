import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { db } from "./firebase";
import { collection, getDocs, query, deleteDoc, where, doc } from "firebase/firestore";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    const cleanupOldTempDocuments = async () => {
      try {
        const tempCollection = collection(db, 'tempPreviewPages');
        const cutoffTime = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const oldDocsQuery = query(tempCollection, where('createdAt', '<', cutoffTime));
        const querySnapshot = await getDocs(oldDocsQuery);
        const deletePromises = querySnapshot.docs.map(docSnap =>
          deleteDoc(doc(db, 'tempPreviewPages', docSnap.id))
        );
        if (deletePromises.length > 0) await Promise.all(deletePromises);
      } catch (err) {
        console.warn('Failed to cleanup old temp documents:', err);
      }
    };
    cleanupOldTempDocuments();
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
