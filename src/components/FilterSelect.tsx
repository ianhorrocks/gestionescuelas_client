import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

interface FilterSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  sortOrder?: "asc" | "desc"; // Nuevo prop para el orden
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  sortOrder,
}) => {
  return (
    <div className="filter-select">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="filter-select-dropdown"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value && (
        <span className="filter-select-icon">
          {sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />}
        </span>
      )}
    </div>
  );
};

export default FilterSelect;
