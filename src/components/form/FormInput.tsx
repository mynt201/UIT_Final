import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const FormInput = ({ className = '', ...props }: InputProps) => {
  return (
    <input
      {...props}
      className={`
        inline-block w-full p-4 leading-6 text-lg font-extrabold
        placeholder-indigo-900 bg-white shadow
        border-2 border-indigo-900 rounded
        focus:outline-none focus:ring-2 focus:ring-indigo-500
        ${className}
      `}
    />
  );
};

export default FormInput;
