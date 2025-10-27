import React, { useState } from "react";
import "./AppLayout.scss";
import { IconName } from "@atoms/Icon";
import { AppHeader } from "@molecules/AppHeader";
import { Navbar } from "@molecules/Navbar";
import { Sidebar } from "@molecules/Sidebar";

interface AppLayoutProps {
  userProfile: {
    name: string;
    avatar?: string;
  };
  hostname: string;
  organization: {
    name: string;
    subtext?: string;
    logo?: React.ReactNode;
  };
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  userProfile,
  hostname,
  organization,
  children,
}) => {
  // Define sidebar items
  const sidebarItems = [
    { icon: IconName.SEARCH_DOCUMENT, label: "Search" },
    { icon: IconName.SEARCH_SQL, label: "SQL Search" },
    { icon: IconName.LAMP, label: "Projects" },
    { icon: IconName.PIPELINE, label: "Pipelines" },
    { icon: IconName.COMPUTER, label: "Data & AI Workspace" },
    { icon: IconName.CUBE, label: "Artifacts" },
    { icon: IconName.DATABASE, label: "Data Sources" },
    { icon: IconName.PIE_CHART, label: "Health Monitoring" },
    { icon: IconName.BULK_CHECK, label: "Bulk Actions" },
    { icon: IconName.CODE, label: "Attribute Management" },
    { icon: IconName.GEAR, label: "Administration" },
  ];

  // State hooks
  const [activeItem, setActiveItem] = useState("Pipelines");

  // Handlers
  const handleSidebarItemClick = (label: string) => {
    setActiveItem(label);
  };

  const handleHomeClick = () => {
    console.log("Home clicked");
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };

  const handleUserProfileClick = () => {
    console.log("User profile clicked");
  };

  return (
    <div className="app-layout">
      <Navbar organization={organization} />

      <div className="content-container">
        <Sidebar
          items={sidebarItems}
          activeItem={activeItem}
          onItemClick={handleSidebarItemClick}
        />

        <div className="main-content">
          <AppHeader
            hostname={hostname}
            userProfile={userProfile}
            onHomeClick={handleHomeClick}
            onSettingsClick={handleSettingsClick}
            onUserProfileClick={handleUserProfileClick}
          />

          <div className="main-layout">{children}</div>
        </div>
      </div>
    </div>
  );
};

export { AppLayout };
export type { AppLayoutProps };
