import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<Props> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center bg-white border border-gray-200 rounded p-1 text-sm text-left focus:ring-2 focus:ring-blue-500 min-h-[30px] text-gray-900"
      >
        <span className="block truncate">
          {selected.length === 0 ? (
            <span className="text-gray-400">{label}</span>
          ) : (
            selected.join(', ')
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-48 overflow-auto rounded-md border border-gray-200">
          <ul className="py-1">
            {options.map((option) => {
              const isSelected = selected.includes(option);
              return (
                <li
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-sm ${
                    isSelected ? 'text-blue-900 font-medium' : 'text-gray-900'
                  }`}
                >
                  <span className="block truncate">{option}</span>
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;