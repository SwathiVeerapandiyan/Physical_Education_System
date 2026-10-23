import React, { createContext, useContext, useState, useCallback } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item ${toast.type}`} onClick={() => removeToast(toast.id)}>
            <div className="toast-icon">
              {toast.type === 'success' && <span style={{color:'#10b981',fontWeight:700}}>&#10003;</span>}
              {toast.type === 'error' && <span style={{color:'#ef4444',fontWeight:700}}>&#10007;</span>}
              {toast.type === 'warning' && <span style={{color:'#f59e0b',fontWeight:700}}>!</span>}
              {toast.type === 'info' && <span style={{color:'#3b82f6',fontWeight:700}}>i</span>}
            </div>
            <div className="toast-message">
              {typeof toast.message === 'string' ? toast.message : (toast.message?.message || JSON.stringify(toast.message))}
            </div>
            <button className="toast-close-btn">&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
