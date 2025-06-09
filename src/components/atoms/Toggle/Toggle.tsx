import React, { useState } from "react";
import "./Toggle.scss";

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  className,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;

    const newState = !isChecked;
    setIsChecked(newState);
    onChange?.(newState);
  };

  const containerClasses = [
    "toggle-container",
    disabled ? "disabled" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const switchClasses = [
    "toggle-switch",
    isChecked ? "checked" : "unchecked",
    disabled ? "disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const knobClasses = ["toggle-knob", isChecked ? "checked" : "unchecked"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} onClick={handleToggle}>
      <div className={switchClasses}>
        <div className={knobClasses} />
      </div>
      {label && <span className="toggle-label">{label}</span>}
    </div>
  );
};

export { Toggle };
export type { ToggleProps };
