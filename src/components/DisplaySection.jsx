// src/components/DisplaySection.js
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { db } from '../firebase';

function DisplaySection() {
  const [displayCode, setDisplayCode] = useState('');
  const [displayImage, setDisplayImage] = useState(null);
  const [searchStatus, setSearchStatus] = useState(null);
  const [recentUploads, setRecentUploads] = useState(null);

  // Check for recent uploads from localStorage when component mounts
  useEffect(() => {
    const checkRecentUploads = () => {
      try {
        const recentData = localStorage.getItem('recentUploads');
        if (recentData) {
          const parsedData = JSON.parse(recentData);
          setRecentUploads(parsedData);
          
          // Automatically display the recent upload
          setDisplayImage(parsedData);
          setDisplayCode(parsedData.code || '');
          
          // Clear localStorage after displaying
          // Comment this out if you want the data to persist
          // localStorage.removeItem('recentUploads');
        }
      } catch (error) {
        console.error('Error parsing recent uploads:', error);
      }
    };
    
    checkRecentUploads();
  }, []);

  // Function to handle image search
  const searchImage = async () => {
    if (!displayCode.trim()) {
      setSearchStatus({
        type: 'warning',
        message: 'Please enter a display code'
      });
      return;
    }
    
    try {
      setSearchStatus({
        type: 'info',
        message: 'Searching...'
      });
      
      const docRef = doc(db, 'sessions', displayCode.trim());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDisplayImage(data);
        setSearchStatus({
          type: 'success',
          message: 'Image found!'
        });
      } else {
        setDisplayImage(null);
        setSearchStatus({
          type: 'danger',
          message: `No image found with code: ${displayCode}`
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setDisplayImage(null);
      setSearchStatus({
        type: 'danger',
        message: `Error searching for image: ${error.message}`
      });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchImage();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        <i className="bi bi-image"></i> Display Image
      </h2>
      
      <div className="mb-3">
        <label htmlFor="displayCodeInput" className="form-label">Enter Display Code</label>
        <div className="input-group">
          <input 
            type="text" 
            className="form-control" 
            id="displayCodeInput" 
            placeholder="Enter code to display image"
            value={displayCode}
            onChange={(e) => setDisplayCode(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            className="btn btn-outline-primary" 
            type="button"
            onClick={searchImage}
          >
            <i className="bi bi-search"></i> Search
          </button>
        </div>
      </div>
      
      {searchStatus && (
        <div className={`alert alert-${searchStatus.type} mt-3`} role="alert">
          {searchStatus.message}
        </div>
      )}
      
      {recentUploads && !displayImage && (
        <div className="alert alert-info mt-3" role="alert">
          You recently uploaded an image with code: <strong>{recentUploads.code}</strong>. 
          Use this code to display your image.
        </div>
      )}
      
      {displayImage && (
        <div className="image-display mt-4">
          <div className="image-container mb-3">
            <img 
              src={displayImage.imageUrl} 
              alt={displayImage.fileName || "Displayed image"} 
              className="img-fluid"
            />
          </div>
          
          <div className="image-details">
            <h3>Image Details</h3>
            <ul className="list-group">
              <li className="list-group-item">
                <strong>File Name:</strong> {displayImage.fileName || "N/A"}
              </li>
              <li className="list-group-item">
                <strong>Upload Date:</strong> {formatDate(displayImage.uploadDate) || "N/A"}
              </li>
              <li className="list-group-item">
                <strong>Display Code:</strong> {displayCode}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplaySection;