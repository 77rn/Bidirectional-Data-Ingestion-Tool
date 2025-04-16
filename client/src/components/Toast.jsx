import React from "react";

const Toast = ({ message, type }) => {
  return (
    <div
      className={`fixed bottom-4 right-4 px-6 py-2 rounded shadow-lg z-50
        transition-opacity duration-500 ease-in-out opacity-100 animate-fade
        ${type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
    >
      {message}
    </div>
  );
};

export default Toast;