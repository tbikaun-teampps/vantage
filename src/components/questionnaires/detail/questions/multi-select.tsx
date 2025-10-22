import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IconX, IconSearch } from "@tabler/icons-react";

interface Option {
  id: string;
  name: string;
  description?: string;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  searchable = false,
}: {
  options: string[] | Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchValue("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Helper function to get option display value
  const getOptionValue = (option: string | Option): string => {
    return typeof option === 'string' ? option : option.name;
  };

  const toggleOption = (option: string | Option) => {
    if (disabled) return;
    
    const optionValue = getOptionValue(option);
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const removeOption = (option: string) => {
    if (disabled) return;
    onChange(value.filter((v) => v !== option));
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Filter options based on search
  const filteredOptions = searchable ? 
    options.filter(option => {
      const optionValue = getOptionValue(option);
      return optionValue.toLowerCase().includes(searchValue.toLowerCase());
    }) : options;

  return (
    <div className="relative" ref={containerRef}>
      <div className={`min-h-[40px] border border-input rounded-md px-3 py-2 text-sm ring-offset-background ${
        disabled 
          ? 'bg-muted cursor-not-allowed opacity-60' 
          : 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
      }`}>
        <div className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs">
              {item}
              {!disabled && (
                <button
                  type="button"
                  className="ml-1 hover:bg-secondary-foreground/20 rounded-sm p-0.5 -m-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(item);
                  }}
                >
                  <IconX className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          <input
            className={`flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            placeholder={value.length === 0 ? placeholder : ""}
            onClick={handleInputClick}
            readOnly
            disabled={disabled}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full bottom-full mb-1 bg-popover border border-border rounded-md shadow-md max-h-64 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b">
              <div className="relative">
                <IconSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-8 h-8"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-auto">
            {filteredOptions.map((option) => {
              const optionValue = getOptionValue(option);
              const isSelected = value.includes(optionValue);
              const isObject = typeof option === 'object';
              
              return (
                <div
                  key={typeof option === 'string' ? option : option.id}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-accent flex items-start gap-2"
                  onClick={() => toggleOption(option)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className={`w-4 h-4 border rounded ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-input"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-sm m-0.5" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{optionValue}</div>
                    {isObject && option.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchable && searchValue ? "No roles found" : "No options available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}