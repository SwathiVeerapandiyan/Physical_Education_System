import React from 'react';
import './Spinner.css';

const Spinner = ({ fullPage = false, message = 'Loading details...' }) => {
  if (fullPage) {
    return (
      <div className="spinner-overlay">
        <div className="spinner-container">
          <div className="custom-spinner"></div>
          <p className="spinner-message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spinner-inline">
      <div className="custom-spinner sm"></div>
      {message && <p className="spinner-message sm">{message}</p>}
    </div>
  );
};

export default Spinner;
