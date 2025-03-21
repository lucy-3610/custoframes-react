// src/components/LoadingModal.js
import React, { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

function LoadingModal({ isLoading, message }) {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);
  
  useEffect(() => {
    // Initialize modal
    if (modalRef.current) {
      modalInstance.current = new Modal(modalRef.current, {
        backdrop: 'static',
        keyboard: false
      });
    }
    
    // Show or hide modal based on isLoading prop
    if (isLoading && modalInstance.current) {
      modalInstance.current.show();
    } else if (!isLoading && modalInstance.current) {
      modalInstance.current.hide();
    }
    
    // Cleanup on unmount
    return () => {
      if (modalInstance.current) {
        modalInstance.current.hide();
      }
    };
  }, [isLoading]);

  return (
    <div 
      className="modal fade loading-modal" 
      id="loadingModal" 
      data-bs-backdrop="static" 
      data-bs-keyboard="false" 
      tabIndex="-1" 
      aria-labelledby="loadingModalLabel" 
      aria-hidden="true"
      ref={modalRef}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-body text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 id="loadingMessage">{message}</h5>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingModal;