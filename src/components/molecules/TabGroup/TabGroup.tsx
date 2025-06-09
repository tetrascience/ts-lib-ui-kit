import React, { useState } from "react";
import { Tab, TabProps, TabSize } from "@atoms/Tab";
import "./TabGroup.scss";

interface TabItem extends Omit<TabProps, "active" | "onClick"> {
  id: string;
}

interface TabGroupProps {
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  disabled?: boolean;
  size?: TabSize;
}

const TabGroup: React.FC<TabGroupProps> = ({
  tabs,
  activeTab,
  onChange,
  disabled = false,
  size = "medium",
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(
    activeTab || (tabs.length > 0 ? tabs[0].id : "")
  );

  const handleTabClick = (tabId: string) => {
    if (disabled) return;

    setSelectedTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="tab-group-container">
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          label={tab.label}
          active={activeTab ? activeTab === tab.id : selectedTab === tab.id}
          disabled={disabled || tab.disabled}
          size={tab.size || size}
          onClick={() => handleTabClick(tab.id)}
        />
      ))}
    </div>
  );
};

export { TabGroup };
export type { TabGroupProps, TabItem };
