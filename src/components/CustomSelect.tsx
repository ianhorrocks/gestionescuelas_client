import React, { useState, useMemo } from "react";

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Memorizar las opciones filtradas
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, options]
  );

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm(""); // Limpiar el término de búsqueda al seleccionar
  };

  return (
    <div className="form-group custom-select-wrapper">
      <input
        type="text"
        className="floating-input custom-select__search"
        placeholder=" "
        value={
          searchTerm ||
          (value ? options.find((opt) => opt.value === value)?.label : "")
        }
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Retraso para permitir clic en opciones
      />
      <label className="floating-label">{placeholder}</label>
      {isOpen && (
        <div className="custom-select__dropdown">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="custom-select__option"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
