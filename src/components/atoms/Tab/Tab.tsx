import React from "react";
import "./Tab.scss";

type TabSize = "small" | "medium";

interface TabProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  size?: TabSize;
  onClick?: () => void;
}

const Tab: React.FC<TabProps> = ({
  label,
  active = false,
  disabled = false,
  size = "medium",
  onClick,
}) => {
  const getClassNames = () => {
    let classNames = "tab";
    classNames += ` tab--${size}`;
    classNames += active ? " tab--active" : " tab--inactive";
    if (disabled) {
      classNames += " tab--disabled";
    }
    return classNames;
  };

  return (
    <button className={getClassNames()} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
};

export { Tab };
export type { TabProps, TabSize };
