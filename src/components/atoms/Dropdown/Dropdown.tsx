import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Icon, IconName } from "@atoms/Icon";

export type DropdownSize = "xsmall" | "small";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
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

const DropdownContainer = styled.div<{ width?: string }>`
  position: relative;
  width: ${(props) => props.width || "100%"};
`;

const DropdownButton = styled.button<{
  open: boolean;
  $error?: boolean;
  disabled?: boolean;
  size: DropdownSize;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: ${(props) => (props.size === "xsmall" ? "34px" : "38px")};
  padding: 0 12px;
  background-color: ${(props) =>
    props.disabled ? "var(--grey-100)" : "var(--white-900)"};
  border: 1px solid
    ${(props) => {
      if (props.$error) return "var(--red-error)";
      if (props.disabled) return "var(--grey-200)";
      if (props.open) return "var(--blue-600)";
      return "var(--grey-300)";
    }};
  border-radius: 6px;
  outline: none;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  user-select: ${(props) => (props.disabled ? "none" : "auto")};
  transition: all 0.2s ease;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  color: ${(props) => {
    if (props.disabled) return "var(--grey-400)";
    if (props.open) return "var(--black-900)";
    return "var(--grey-400)";
  }};

  &:hover:not(:disabled) {
    border-color: ${(props) =>
      props.$error ? "var(--red-error)" : "var(--blue-600)"};
    color: var(--black-900) !important;
  }

  &:disabled {
    color: var(--grey-400) !important;
    border-color: var(--grey-300);
  }

  &:active:not(:disabled) {
    color: var(--black-900) !important;
  }

  &:focus {
    outline: none;
    box-shadow: ${(props) =>
      props.$error
        ? "0px 0px 0px 3px var(--red-bg)"
        : "0px 0px 0px 1px var(--white-900), 0px 0px 0px 3px var(--blue-600)"};
    border-color: ${(props) =>
      props.$error ? "var(--red-error)" : "var(--blue-600)"};
  }
`;

const ChevronIcon = styled.div<{ open: boolean }>`
  width: 20px;
  height: 20px;
  transform: ${(props) => (props.open ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.2s ease;
  color: var(--grey-600);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ButtonText = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  text-align: left;
  display: block;
  max-width: calc(100% - 24px);

  .dropdown-menu-item {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const DropdownMenu = styled.ul<{ menuWidth?: string }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: ${(props) => props.menuWidth || "calc(100% - 2px)"};
  max-height: 200px;
  overflow-y: auto;
  background-color: var(--white-900);
  border: 1px solid var(--grey-200);
  border-radius: 6px;
  box-shadow: 0px 4px 8px var(--black-100);
  z-index: 10;
  padding: 4px 0;
  margin: 0;
  list-style: none;
`;

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--grey-400);
`;

const NoDataText = styled.p`
  margin: 8px 0 0 0;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`;

const DropdownItem = styled.li<{ selected: boolean; disabled?: boolean }>`
  padding: 8px 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  background-color: ${(props) =>
    props.selected ? "var(--blue-50)" : "transparent"};
  color: ${(props) => {
    if (props.disabled) return "var(--grey-400)";
    if (props.selected) return "var(--blue-900)";
    return "var(--blue-900)";
  }};
  font-family: "Inter", sans-serif;
  font-size: 14px;
  line-height: 20px;
  transition: background-color 0.2s ease;
  outline: none;

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.selected ? "var(--blue-50)" : "var(--grey-50)"};
  }

  &:focus-visible {
    background-color: var(--blue-50);
    outline: 2px solid var(--blue-600);
    outline-offset: -2px;
  }
`;

export const Dropdown: React.FC<DropdownProps> = ({
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

  return (
    <DropdownContainer ref={dropdownRef} width={width}>
      <DropdownButton
        type="button"
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        open={isOpen}
        disabled={disabled}
        $error={error}
        size={size}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
      >
        <ButtonText>{displayText}</ButtonText>
        <ChevronIcon open={isOpen}>
          <Icon name={IconName.CHEVRON_DOWN} fill="var(--grey-600)" />
        </ChevronIcon>
      </DropdownButton>
      {isOpen && (
        <DropdownMenu
          role="listbox"
          aria-labelledby="dropdown-button"
          menuWidth={menuWidth}
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <DropdownItem
                key={option.value}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                selected={option.value === selectedValue}
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                tabIndex={option.disabled ? -1 : 0}
                role="option"
                aria-selected={option.value === selectedValue}
                aria-disabled={option.disabled}
              >
                {option.label}
              </DropdownItem>
            ))
          ) : (
            <NoDataContainer>
              <Icon
                name={IconName.INBOX}
                fill="var(--grey-400)"
                width="24px"
                height="24px"
              />
              <NoDataText>No Data</NoDataText>
            </NoDataContainer>
          )}
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

export default Dropdown;
