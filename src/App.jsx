import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import DisplayPage from './pages/DisplayPage';
import './App.css';
import LoadingModal from './components/LoadingModal';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  // States for modals that need to be shared across pages
  const [loadingState, setLoadingState] = useState({ isLoading: false, message: "" });
  const [confirmationState, setConfirmationState] = useState({ isOpen: false, code: '', imageFile: null });

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <UploadPage 
              setLoadingState={setLoadingState} 
              setConfirmationState={setConfirmationState} 
            />
          } />
          <Route path="/gallery" element={<DisplayPage />} />
        </Routes>
        
        {/* Modals that need to be accessible from any page */}
        <LoadingModal 
          isLoading={loadingState.isLoading} 
          message={loadingState.message} 
        />
        
        <ConfirmationModal 
          isOpen={confirmationState.isOpen}
          code={confirmationState.code}
          imageFile={confirmationState.imageFile}
          onClose={() => setConfirmationState({ isOpen: false, code: '', imageFile: null })}
          setLoadingState={setLoadingState}
        />
      </div>
    </Router>
  );
}

export default App;