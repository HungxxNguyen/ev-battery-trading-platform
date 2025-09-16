// src/components/Notification/Notification.jsx
import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

const Notification = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <FaCheckCircle className="text-green-500" />,
    error: <FaTimesCircle className="text-red-500" />,
    info: <FaInfoCircle className="text-blue-500" />,
    warning: <FaExclamationTriangle className="text-yellow-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
    warning: "bg-yellow-50 border-yellow-200",
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${bgColors[type]} shadow-lg max-w-xs transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="flex items-start gap-3">
        <div className="text-xl mt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <p className="font-medium text-gray-800">{message}</p>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;