import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, className = '', type = 'button', disabled, ...props }: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      {...props}
      className={`
        inline-block w-full py-4 px-6 mb-6
        text-center text-lg leading-6 text-white font-extrabold
        bg-indigo-800 hover:bg-indigo-900
        border-3 border-indigo-900 shadow rounded
        transition duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;
