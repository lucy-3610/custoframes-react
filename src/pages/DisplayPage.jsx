// src/pages/DisplayPage.js
import React from 'react';
import DisplaySection from '../components/DisplaySection';
import { Link } from 'react-router-dom';

const DisplayPage = () => {
  return (
    <div className="display-page">
      <h1>CustoFrames - My Gallery</h1>
      <DisplaySection />
      <div className="navigation">
        <Link to="/" className="nav-link">Upload More Images</Link>
      </div>
    </div>
  );
};

export default DisplayPage;