// src/components/UploadSection.js
import React, { useState } from 'react';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { useNavigate } from 'react-router-dom'; // Add this import
import { db, storage } from '../firebase';

function UploadSection({ setLoadingState, setConfirmationState }) {
  const [imageFile, setImageFile] = useState(null);
  const [code, setCode] = useState('');
  const [statusMessages, setStatusMessages] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);

  const navigate = useNavigate(); // This is now properly defined

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Function to update file info display
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type
      });
    } else {
      setImageFile(null);
      setFileInfo(null);
    }
  };

  // Function to show status messages
  const showStatus = (message, type = 'success') => {
    const newMessage = {
      id: Date.now(),
      message,
      type
    };
    
    setStatusMessages(prev => [...prev, newMessage]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setStatusMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 5000);
  };

  // Function to upload image
  const uploadImage = async (uploadCode, uploadFile, forceUpload = false) => {
    if (!uploadCode || !uploadFile) {
      showStatus('Please enter a code and select an image', 'danger');
      return;
    }
    
    try {
      // If not forcing upload, check if code exists first
      if (!forceUpload) {
        setLoadingState({
          isLoading: true,
          message: "Checking if code exists..."
        });
        
        const docSnap = await getDoc(doc(db, 'sessions', uploadCode));
        
        if (docSnap.exists()) {
          // Show confirmation modal
          setLoadingState({ isLoading: false, message: "" });
          setConfirmationState({
            isOpen: true,
            code: uploadCode,
            imageFile: uploadFile
          });
          
          // Return early, upload will be handled by modal buttons
          return;
        }
      }
      
      setLoadingState({
        isLoading: true,
        message: "Uploading image..."
      });
      
      // Create a reference to the storage location
      const storageRef = ref(storage, 'images/' + uploadCode);
      
      // Upload the image
      const snapshot = await uploadBytes(storageRef, uploadFile);
      
      // Get the download URL
      const url = await getDownloadURL(snapshot.ref);
      
      // Save the URL to Firestore with metadata
      const imageData = { 
        imageUrl: url,
        uploadDate: new Date().toISOString(),
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        fileType: uploadFile.type,
        code: uploadCode
      };
      
      await setDoc(doc(db, 'sessions', uploadCode), imageData);
      
      setLoadingState({ isLoading: false, message: "" });
      
      // Show success message
      showStatus(`<strong>Success!</strong> Image uploaded successfully with code: <strong>${uploadCode}</strong>`);

      // Save data for the gallery page and navigate there
      localStorage.setItem('recentUploads', JSON.stringify(imageData));
      navigate('/gallery');
      
      // Clear inputs after successful upload
      setImageFile(null);
      setCode('');
      setFileInfo(null);
      
      // Clear file input
      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setLoadingState({ isLoading: false, message: "" });
      console.error('Upload error:', error);
      
      showStatus(`<strong>Error!</strong> Failed to upload image: ${error.message}`, 'danger');
    }
  };

  // Handle upload button click
  const handleUpload = () => {
    uploadImage(code.trim(), imageFile);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && imageFile) {
      handleUpload();
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">
        <i className="bi bi-cloud-arrow-up"></i> Upload Image
      </h2>
      
      <div className="mb-3">
        <label htmlFor="imageInput" className="form-label">Select Image</label>
        <input 
          className="form-control" 
          type="file" 
          id="imageInput" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      
      {fileInfo && (
        <div className="file-info p-3 mt-3 mb-3">
          <div className="d-flex align-items-center">
            <div className="file-icon me-3">
              <i className="bi bi-file-earmark-image"></i>
            </div>
            <div className="flex-grow-1">
              <div className="file-name fw-medium">{fileInfo.name}</div>
              <div className="text-muted small">{formatFileSize(fileInfo.size)}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-3">
        <label htmlFor="codeInput" className="form-label">Display Code</label>
        <input 
          type="text" 
          className="form-control" 
          id="codeInput" 
          placeholder="Enter display code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div className="form-text">Create a unique code to identify your image.</div>
      </div>
      
      <button 
        id="uploadButton" 
        className="btn btn-primary"
        onClick={handleUpload}
      >
        <i className="bi bi-cloud-arrow-up"></i> Upload Image
      </button>
      
      <div id="uploadStatusContainer">
        {statusMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`alert alert-${msg.type} alert-dismissible fade show mt-3`}
            role="alert"
          >
            <span dangerouslySetInnerHTML={{ __html: msg.message }} />
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setStatusMessages(prev => prev.filter(m => m.id !== msg.id))}
            ></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadSection;