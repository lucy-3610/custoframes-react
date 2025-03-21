import React, { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

import { db, storage } from '../firebase';

function ConfirmationModal({ confirmationState, setConfirmationState, setLoadingState }) {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);
  
  useEffect(() => {
    // Only initialize modal when the DOM element exists
    if (modalRef.current) {
      modalInstance.current = new Modal(modalRef.current);
      
      // Show or hide modal based on state
      if (confirmationState && confirmationState.isOpen) {
        modalInstance.current.show();
      } else {
        if (modalInstance.current) {
          modalInstance.current.hide();
        }
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (modalInstance.current) {
        modalInstance.current.hide();
        modalInstance.current.dispose();
      }
    };
  }, [confirmationState, modalRef.current]); // Add modalRef.current to dependencies

  // Function to handle modal hidden event
  const handleModalHidden = () => {
    // Only update state if modal was actually shown before and confirmationState exists
    if (confirmationState && confirmationState.isOpen) {
      setConfirmationState({
        isOpen: false,
        code: "",
        imageFile: null
      });
    }
  };

  // Add event listener for modal hidden event
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
      return () => {
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      };
    }
  }, [confirmationState]);

  // Function to handle continue button click
  const handleContinue = async () => {
    // Make sure modalInstance exists before using it
    if (!modalInstance.current) return;
    
    // Close modal
    modalInstance.current.hide();
    
    // Set loading state
    setLoadingState({
      isLoading: true,
      message: "Uploading image..."
    });
    
    try {
      if (!confirmationState) return;
      const { code, imageFile } = confirmationState;
      
      if (!code || !imageFile) {
        console.error('Missing required data for upload');
        return;
      }
      
      // Create a reference to the storage location
      const storageRef = ref(storage, 'images/' + code);
      
      // Upload the image
      const snapshot = await uploadBytes(storageRef, imageFile);
      
      // Get the download URL
      const url = await getDownloadURL(snapshot.ref);
      
      // Save the URL to Firestore with metadata
      await setDoc(doc(db, 'sessions', code), { 
        imageUrl: url,
        uploadDate: new Date().toISOString(),
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      });
      
      // Show success message (this will be handled by the parent component)
      
      // Clear file input
      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      // Error handling will be done by parent component
    } finally {
      setLoadingState({ isLoading: false, message: "" });
    }
  };

  // Return null if confirmationState is undefined to prevent rendering issues
  if (!confirmationState) {
    return null;
  }

  return (
    <div 
      className="modal fade" 
      id="confirmationModal" 
      tabIndex="-1" 
      aria-labelledby="confirmationModalLabel" 
      aria-hidden="true"
      ref={modalRef}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="confirmationModalLabel">Code Already Exists</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <p>A display code "<span>{confirmationState.code}</span>" already has an image associated with it.</p>
            <p>Would you like to replace the existing image?</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel Upload</button>
            <button type="button" className="btn btn-primary" onClick={handleContinue}>Replace Existing Image</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;