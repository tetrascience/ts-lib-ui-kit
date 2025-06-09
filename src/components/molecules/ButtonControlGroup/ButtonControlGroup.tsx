import React from "react";
import { ButtonControl, ButtonControlProps } from "@atoms/ButtonControl";
import "./ButtonControlGroup.scss";

interface ButtonControlItem extends ButtonControlProps {
  id: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ButtonControlGroupProps {
  controls: ButtonControlItem[];
  selectedId?: string;
  onChange?: (id: string) => void;
  vertical?: boolean;
  disabled?: boolean;
}

const ButtonControlGroup: React.FC<ButtonControlGroupProps> = ({
  controls,
  selectedId,
  onChange,
  vertical = true,
  disabled = false,
}) => {
  const handleClick = (id: string) => {
    if (disabled) return;
    onChange?.(id);
  };

  const containerClasses = [
    "button-control-group",
    vertical
      ? "button-control-group--vertical"
      : "button-control-group--horizontal",
  ].join(" ");

  return (
    <div className={containerClasses}>
      {controls.map((control) => (
        <div key={control.id} className="button-control-group__item">
          <ButtonControl
            icon={control.icon}
            selected={selectedId === control.id}
            disabled={disabled || control.disabled}
            onClick={() => handleClick(control.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { ButtonControlGroup };
export type { ButtonControlGroupProps, ButtonControlItem };
