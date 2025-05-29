import React, { useState } from "react";
import styled from "styled-components";
import { Tab, TabProps, TabSize } from "@atoms/Tab";

export interface TabItem extends Omit<TabProps, "active" | "onClick"> {
  id: string;
}

export interface TabGroupProps {
  tabs: TabItem[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  disabled?: boolean;
  size?: TabSize;
}

const TabGroupContainer = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--grey-200);
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const TabGroup: React.FC<TabGroupProps> = ({
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
    <TabGroupContainer>
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
    </TabGroupContainer>
  );
};

export default TabGroup;
