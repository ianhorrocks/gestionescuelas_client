import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface FilterSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  keyboard?: boolean;
  autoClose?: boolean;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  className,
  keyboard = false,
  autoClose = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!autoClose || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [autoClose, isOpen]);

  return (
    <div ref={containerRef} className={`filter-select ${className || ""}`}>
      <div
        className="filter-select-wrapper"
        onClick={handleToggle}
        tabIndex={0}
        onKeyDown={(e) => {
          if (!keyboard || !isOpen) return;
          const currentIndex = options.findIndex((opt) => opt.value === value);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = options[(currentIndex + 1) % options.length];
            onChange(next.value);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev =
              options[(currentIndex - 1 + options.length) % options.length];
            onChange(prev.value);
          } else if (e.key === "Enter") {
            setIsOpen(false);
          } else if (e.key === "Escape") {
            e.preventDefault();
            setIsOpen(false);
          }
        }}
      >
        <span className="filter-select-value">
          {options.find((option) => option.value === value)?.label ||
            placeholder}
        </span>
        <span className="filter-select-icon">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>

      {isOpen && (
        <div className="filter-select-dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className="filter-select-option"
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

export default FilterSelect;
