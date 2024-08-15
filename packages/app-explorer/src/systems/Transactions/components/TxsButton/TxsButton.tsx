import React from 'react';

interface TxsButtonProps {
  children: React.ReactNode; // Use children instead of buttonName
  type?: 'button' | 'submit' | 'reset';
}

function TxsButton({ children, type = 'button' }: TxsButtonProps) {
  return (
    <button
      type={type}
      className="dark:bg-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.1)] px-3 py-1 rounded-sm text-sm mb-3 flex justify-center items-center gap-2"
    >
      {children} {/* Render children here */}
    </button>
  );
}

export default TxsButton;
