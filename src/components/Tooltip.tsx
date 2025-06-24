import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className="absolute bottom-full mb-2 w-max px-3 py-1.5 bg-text-primary text-primary text-xs font-semibold rounded-md shadow-lg"
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip; 