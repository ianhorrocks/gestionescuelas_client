import React, { useState, useMemo, useEffect, useRef } from "react";

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!isOpen) {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        setDropdownPosition({
          top: rect.bottom,
          left: rect.left,
          width: rect.width,
        });
      }
    }
    setIsOpen(!isOpen);
  };

  // Siempre mostrar el label correspondiente al value actual
  const displayValue = useMemo(() => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? selectedOption.label : "";
  }, [value, options]);

  // Filtrar opciones en base al input del usuario
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, options]
  );

  // Manejar selección
  const handleOptionClick = (optionValue: string) => {
    if (!disabled) {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  // Resetear búsqueda si cambia el valor externo
  useEffect(() => {
    const selected = options.find((opt) => opt.value === value);
    if (selected) {
      setSearchTerm("");
    }
  }, [value, options]);

  return (
    <div className="form-group custom-select-wrapper" ref={ref}>
      <input
        type="text"
        className="floating-input custom-select__search"
        placeholder=" "
        value={isOpen ? searchTerm : displayValue}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => !disabled && toggleDropdown()}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        disabled={disabled}
      />
      <label className="floating-label">{placeholder}</label>
      {isOpen && (
        <div
          className="custom-select__dropdown"
          style={{
            top: dropdownPosition?.top,
            left: dropdownPosition?.left,
            width: dropdownPosition?.width,
          }}
        >
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
