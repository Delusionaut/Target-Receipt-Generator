import React from 'react';

const TargetBullseye = () => {
  return (
    <svg 
      viewBox="0 0 120 120" 
      className="target-logo"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}
      width="90"
      height="90"
    >
      <circle cx="60" cy="60" r="50" fill="none" stroke="#000000" strokeWidth="10"/>
      <circle cx="60" cy="60" r="30" fill="none" stroke="#000000" strokeWidth="10"/>
      <circle cx="60" cy="60" r="10" fill="#000000"/>
    </svg>
  );
};

export default TargetBullseye;
