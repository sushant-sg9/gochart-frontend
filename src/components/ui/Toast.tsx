import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaTimesCircle } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <FaInfoCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastClasses = (type: string) => {
    const baseClasses = "backdrop-blur-xl rounded-lg p-4 border shadow-lg transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-900/80 border-green-500/50`;
      case 'error':
        return `${baseClasses} bg-red-900/80 border-red-500/50`;
      case 'warning':
        return `${baseClasses} bg-yellow-900/80 border-yellow-500/50`;
      case 'info':
        return `${baseClasses} bg-blue-900/80 border-blue-500/50`;
      default:
        return `${baseClasses} bg-gray-900/80 border-gray-500/50`;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastClasses(toast.type)}
        >
          <div className="flex items-start space-x-3">
            {getIcon(toast.type)}
            <div className="flex-1">
              <p className="text-white font-medium">{toast.title}</p>
              {toast.message && (
                <p className="text-gray-300 text-sm mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;