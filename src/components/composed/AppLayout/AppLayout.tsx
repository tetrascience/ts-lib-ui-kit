import "./AppLayout.scss";
import {
  Box,
  CheckCheck,
  Code,
  Database,
  Lamp,
  Monitor,
  PieChart,
  Search,
  SearchCode,
  Settings,
  Workflow,
} from "lucide-react";
import React, { useState } from "react";

import { AppHeader } from "@/components/composed/AppHeader";
import { Navbar } from "@/components/composed/Navbar";
import { AppSidebar } from "@/components/composed/Sidebar";

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
    { icon: Search, label: "Search" },
    { icon: SearchCode, label: "SQL Search" },
    { icon: Lamp, label: "Projects" },
    { icon: Workflow, label: "Pipelines" },
    { icon: Monitor, label: "Data & AI Workspace" },
    { icon: Box, label: "Artifacts" },
    { icon: Database, label: "Data Sources" },
    { icon: PieChart, label: "Health Monitoring" },
    { icon: CheckCheck, label: "Bulk Actions" },
    { icon: Code, label: "Attribute Management" },
    { icon: Settings, label: "Administration" },
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
        <AppSidebar
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
