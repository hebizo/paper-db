// paper_db/app/javascript/entrypoints/application.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PaperListPage from './pages/PaperListPage';
// import PaperDetailPage from './pages/PaperDetailPage';
// import PaperNewPage from './pages/PaperNewPage';
// import PaperEditPage from './pages/PaperEditPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaperListPage />} />
      <Route path="/papers" element={<PaperListPage />} />
      {/*<Route path="/papers/new" element={<PaperNewPage />} /> 
      <Route path="/papers/:paperId" element={<PaperDetailPage />} />
      <Route path="/papers/:paperId/edit" element={<PaperEditPage />} /> */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;