
import React from 'react';

interface CredentialInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
}

const CredentialInput: React.FC<CredentialInputProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
}) => {
  return (
    <div>
      <label htmlFor={label} className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={label}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 shadow-sm placeholder-slate-400
                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
};

export default CredentialInput;
