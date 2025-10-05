import React from 'react';

const SearchBar: React.FC<{ 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = "Rechercher..." }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  );
};

export default SearchBar;