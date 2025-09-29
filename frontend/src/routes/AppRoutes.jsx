import React from "react";
import { Routes, Route } from "react-router-dom";

// Import pages
import MainApp from "../Pages/MainApp/MainApp"; // Correct import for MainApp
import AllCareers from "../Pages/AllCareers/AllCareers";
import EditCareers from "../Pages/EditCareers/EditCareers";
import CareerLibrary from "../Pages/CareerLibrary/CareerLibrary.tsx";
import ApiHealth from "../Pages/ApiHealth/ApiHealth";
import PreviewPage from "../Pages/previewPage/careerPreview.tsx";
import CareerFinal from "../Pages/FinalCareerPage/careerFinal.tsx"; // Updated import
import TablePage from "../Pages/TablePage/tablePage.tsx";
import { DataProvider } from "../contexts/DataContext";
import CareerCategoryPage from "../Pages/CareerCategoryPage/CareerCategoryPage.tsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/main-app" element={<MainApp />} />
      <Route path="/all-careers" element={<AllCareers />} />
      <Route path="/edit-careers" element={<EditCareers />} />
      <Route path="/" element={<CareerLibrary />} />
      <Route path="/api-health" element={<ApiHealth />} />
      <Route
        path="/table-page"
        element={
          <DataProvider>
            <TablePage />
          </DataProvider>
        }
      />
      <Route path="/preview-career" element={<PreviewPage />} />
      <Route path="/preview-career/:slug" element={<PreviewPage />} />
      <Route path="/career/:slug" element={<CareerFinal />} />
      <Route path="/:category" element={<CareerCategoryPage />} />
    </Routes>
  );
};

export default AppRoutes;
