import React, { useEffect, useRef, useState } from "react";
import { Icon, IconName } from "@atoms/Icon";
import "./Dropdown.scss";

type DropdownSize = "xsmall" | "small";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: DropdownSize;
  onChange?: (value: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
  width?: string;
  menuWidth?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  value,
  placeholder = "Select an option",
  disabled = false,
  error = false,
  size = "small",
  onChange,
  onOpen,
  onClose,
  width,
  menuWidth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          onClose?.();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      itemRefs.current = itemRefs.current.slice(0, options.length);
    }
  }, [isOpen, options.length]);

  useEffect(() => {
    if (isOpen && itemRefs.current.length > 0) {
      const selectedIndex = options.findIndex(
        (option) => option.value === selectedValue
      );
      const indexToFocus = selectedIndex >= 0 ? selectedIndex : 0;

      setTimeout(() => {
        if (itemRefs.current[indexToFocus]) {
          itemRefs.current[indexToFocus]?.focus();
        }
      }, 10);
    }
  }, [isOpen, options, selectedValue]);

  const handleToggle = () => {
    if (!disabled) {
      const newState = !isOpen;
      setIsOpen(newState);
      if (newState) {
        onOpen?.();
      } else {
        onClose?.();
      }
    }
  };

  const handleSelect = (option: DropdownOption) => {
    if (!option.disabled) {
      setSelectedValue(option.value);
      setIsOpen(false);
      onChange?.(option.value);
      onClose?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const option = options[index];

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!option.disabled) {
          handleSelect(option);
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (index < options.length - 1) {
          let nextIndex = index + 1;
          while (nextIndex < options.length) {
            if (!options[nextIndex].disabled) {
              itemRefs.current[nextIndex]?.focus();
              break;
            }
            nextIndex++;
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) {
          let prevIndex = index - 1;
          while (prevIndex >= 0) {
            if (!options[prevIndex].disabled) {
              itemRefs.current[prevIndex]?.focus();
              break;
            }
            prevIndex--;
          }
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        onClose?.();
        break;
      case "Tab":
        setIsOpen(false);
        onClose?.();
        break;
      default:
        break;
    }
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled) {
      switch (e.key) {
        case "Enter":
        case " ":
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            onOpen?.();
          }
          break;
        case "Escape":
          e.preventDefault();
          if (isOpen) {
            setIsOpen(false);
            onClose?.();
          }
          break;
        default:
          break;
      }
    }
  };

  const selectedOption = options.find(
    (option) => option.value === selectedValue
  );
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const containerClassName = `dropdown-container ${
    width ? "custom-width" : ""
  }`;
  const buttonClassName = `dropdown-button size-${size} ${
    isOpen ? "open" : ""
  } ${error ? "error" : ""} ${disabled ? "disabled" : ""}`;
  const chevronClassName = `chevron-icon ${isOpen ? "open" : ""}`;
  const menuClassName = `dropdown-menu ${menuWidth ? "custom-menu-width" : ""}`;

  const containerStyle = width
    ? ({ "--dropdown-width": width } as React.CSSProperties)
    : {};
  const menuStyle = menuWidth
    ? ({ "--menu-width": menuWidth } as React.CSSProperties)
    : {};

  return (
    <div
      ref={dropdownRef}
      className={containerClassName}
      style={containerStyle}
    >
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        disabled={disabled}
        className={buttonClassName}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
      >
        <div className="button-text">{displayText}</div>
        <div className={chevronClassName}>
          <Icon name={IconName.CHEVRON_DOWN} fill="var(--grey-600)" />
        </div>
      </button>
      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby="dropdown-button"
          className={menuClassName}
          style={menuStyle}
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <li
                key={option.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={`dropdown-item ${
                  option.value === selectedValue ? "selected" : ""
                } ${option.disabled ? "disabled" : ""}`}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={option.disabled ? -1 : 0}
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled}
              >
                {option.label}
              </li>
            ))
          ) : (
            <div className="no-data-container">
              <Icon
                name={IconName.INBOX}
                fill="var(--grey-400)"
                width="24px"
                height="24px"
              />
              <p className="no-data-text">No Data</p>
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export { Dropdown };
export type { DropdownProps, DropdownSize, DropdownOption };
