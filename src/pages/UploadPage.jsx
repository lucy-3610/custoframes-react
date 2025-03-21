// src/pages/UploadPage.js
import React from 'react';
import UploadSection from '../components/UploadSection';
import { Link } from 'react-router-dom';

const UploadPage = ({ setLoadingState, setConfirmationState }) => {
  return (
    <div className="upload-page">
      <div className="container py-5">
        <div className="header mb-4">
          <h1>CustoFrames - Upload Your Images</h1>
          <p className="text-muted">Upload your images and get a unique code to display them later</p>
        </div>
        
        <UploadSection 
          setLoadingState={setLoadingState} 
          setConfirmationState={setConfirmationState} 
        />
        
        <div className="navigation mt-4">
          <Link to="/gallery" className="btn btn-outline-primary">
            <i className="bi bi-images"></i> View My Gallery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;