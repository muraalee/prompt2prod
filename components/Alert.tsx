
import React from 'react';

interface AlertProps {
  message: string;
  type: 'error' | 'success';
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const baseClasses = 'p-4 mb-4 text-sm rounded-lg';
  const typeClasses = {
    error: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} flex justify-between items-center`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="-mr-1 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Alert;
