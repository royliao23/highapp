import React from "react";

interface DropdownProps {
  name: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

const StringDropdown: React.FC<DropdownProps> = ({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
}) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="dropdown" 
    >
      <option value="" >
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};



export default StringDropdown;
