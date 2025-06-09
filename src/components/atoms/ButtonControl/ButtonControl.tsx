import React from "react";
import "./ButtonControl.scss";

interface ButtonControlProps {
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const ButtonControl: React.FC<ButtonControlProps> = ({
  icon,
  selected = false,
  disabled = false,
  onClick,
}) => {
  const buttonClasses = [
    "button-control",
    selected && "button-control--selected",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {icon}
    </button>
  );
};

export { ButtonControl };
export type { ButtonControlProps };
