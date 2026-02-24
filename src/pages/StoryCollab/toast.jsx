import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';

const CustomToast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    const baseStyles = 'fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-[99999] transition-all duration-300 flex items-center justify-between';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`;
      case 'error':
        return `${baseStyles} bg-[#ff3333] text-white`;
      case 'info':
        return `${baseStyles} bg-blue-500 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-black`;
      default:
        return baseStyles;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose && onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={getStyles()}>
      <span className="mr-4">{message}</span>
      <button 
        onClick={handleClose} 
        className="hover:bg-opacity-20 hover:bg-white rounded-full w-8 h-8 transition-all"
        aria-label="Close toast"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default CustomToast;