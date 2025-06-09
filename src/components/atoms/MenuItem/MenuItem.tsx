import { forwardRef } from "react";
import { Checkbox } from "@atoms/Checkbox";
import "./MenuItem.scss";

interface MenuItemProps {
  label: string;
  checked?: boolean;
  showCheckbox?: boolean;
  onClick?: () => void;
  onCheckChange?: (checked: boolean) => void;
  active?: boolean;
  className?: string;
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      label,
      checked = false,
      showCheckbox = false,
      onClick,
      onCheckChange,
      active = false,
      className,
    },
    ref
  ) => {
    const handleClick = () => {
      console.log("MenuItem clicked!");
      if (onClick) {
        onClick();
      }
    };

    const handleCheckboxChange = (isChecked: boolean) => {
      console.log("Checkbox changed:", isChecked);
      if (onCheckChange) {
        onCheckChange(isChecked);
      }
    };

    // This stops the event from propagating to the parent (menu-item)
    const handleCheckboxClick = (e: React.MouseEvent) => {
      console.log("Checkbox clicked!");
      e.stopPropagation();
    };

    const menuItemClasses = [
      "menu-item",
      active ? "default active" : "default",
      showCheckbox ? "with-checkbox" : "",
      className || "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={menuItemClasses}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        {!showCheckbox && <div className="item-content">{label}</div>}
        {showCheckbox && (
          <div className="checkbox-container" onClick={handleCheckboxClick}>
            <Checkbox
              checked={checked}
              onChange={handleCheckboxChange}
              onClick={handleCheckboxClick}
              label={label}
            />
          </div>
        )}
      </div>
    );
  }
);

MenuItem.displayName = "MenuItem";

export { MenuItem };
export type { MenuItemProps };
