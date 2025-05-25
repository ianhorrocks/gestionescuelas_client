import React, { useState, useMemo, useEffect, useRef } from "react";

interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disableSearch?: boolean; // <-- AGREGADO
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  disabled = false,
  disableSearch = false, // <-- AGREGADO
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLDivElement>(null);

  // Siempre mostrar el label correspondiente al value actual
  const displayValue = useMemo(() => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? selectedOption.label : "";
  }, [value, options]);

  // Filtrar opciones en base al input del usuario
  const filteredOptions = useMemo(
    () =>
      disableSearch
        ? options // Si está deshabilitado, no filtra
        : options.filter((option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
          ),
    [searchTerm, options, disableSearch]
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

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const dropdown = document.querySelector(".custom-select__dropdown");
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        dropdown &&
        !dropdown.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="form-group custom-select-wrapper"
      ref={ref}
      style={{ position: "relative" }}
    >
      {disableSearch ? (
        <div
          className="floating-input custom-select__search"
          tabIndex={0}
          ref={inputRef as React.RefObject<HTMLDivElement>}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          style={{
            minHeight: "38px",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #757575",
            background: "transparent",
            paddingLeft: "8px",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {displayValue || ""}
        </div>
      ) : (
        <input
          type="text"
          className="floating-input custom-select__search"
          placeholder=" "
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          disabled={disabled}
          autoComplete="off"
          ref={inputRef as React.RefObject<HTMLInputElement>}
        />
      )}
      <label className="floating-label">{placeholder}</label>
      {isOpen && (
        <div
          className="custom-select__dropdown"
          style={{
            position: "absolute",
            top: inputRef.current
              ? (inputRef.current as HTMLElement).offsetHeight
              : 38,
            left: 0,
            width: "100%",
            zIndex: 3000,
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
