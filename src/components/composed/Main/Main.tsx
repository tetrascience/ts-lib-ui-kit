// import { ReactFlowProvider } from "@xyflow/react";
// import {PipelineBuilder} from "./pipeline-builder";
import {
  Box,
  CheckCheck,
  Code,
  Database,
  Inbox,
  Lamp,
  Monitor,
  PieChart,
  Plus,
  Search,
  SearchCode,
  Settings,
  Trash2,
  Workflow,
} from "lucide-react";
import React, { useState } from "react";

import { LaunchContentPanel } from "./LaunchContentPanel";
import { MainHeader, type UserProfileInfo } from "./MainHeader";
import { MainNavbar, type OrganizationInfo } from "./MainNavbar";
import { MainSidebar, type MainSidebarItem } from "./MainSidebar";
import { MainTabBar, type MainTabItem } from "./MainTabBar";
import { ProtocolConfigurationPanel } from "./ProtocolConfigurationPanel";
import { TemplateSidebarCard } from "./TemplateSidebarCard";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";

export interface MainProps {
  userProfile: UserProfileInfo;
  hostname: string;
  organization: OrganizationInfo;
}

const Main: React.FC<MainProps> = ({ userProfile, hostname, organization }) => {
  // Define sidebar items
  const sidebarItems: MainSidebarItem[] = [
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

  // Tabs for the first tab group (left side)
  const leftTabs: MainTabItem[] = [
    { id: "templates", label: "Templates" },
    { id: "protocol", label: "Protocol" },
    { id: "steps", label: "Steps" },
  ];

  // Tabs for the second tab group (right side)
  const rightTabs: MainTabItem[] = [
    { id: "pipelineBuilder", label: "Pipeline Builder" },
    { id: "configuration", label: "Configuration" },
    { id: "launch", label: "Launch" },
  ];

  // State hooks
  const [activeItem, setActiveItem] = useState("Pipelines");
  const [activeLeftTab, setActiveLeftTab] = useState("templates");
  const [activeRightTab, setActiveRightTab] = useState("pipelineBuilder");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>("1");

  // Templates data
  const templates = [
    {
      id: "1",
      title: "Tecan D300e and PerkinElmer EnVision to Dotmatics (v1)",
      description: "c901ejs",
      buttonText: "",
      linkText: "",
    },
    {
      id: "2",
      title: "Bruker D8 Andvanced CRD Raw to IDS(Draft)",
      description: "c901ejs",
      buttonText: "",
      linkText: "",
    },
    {
      id: "3",
      title: "Extract and Decorate(Draft)",
      description: "c901ejs",
      buttonText: "",
      linkText: "",
    },
    {
      id: "4",
      title: "Intellict (Que3 Raw to IDS(Draft)",
      description: "c901ejs",
      buttonText: "",
      linkText: "",
    },
    {
      id: "5",
      title: "Leica Aperio RAW to IDS(Draft)",
      description: "c901ejs",
      buttonText: "",
      linkText: "",
    },
    {
      id: "6",
      title: "IDS to Benchling(Draft)",
      description: "c901ejs",
      buttonText: "",
      linkText: "",
    },
    {
      id: "7",
      title: "Lorem Ipsum",
      description: "c901ejs",
      buttonText: "",
      linkText: "",
    },
  ];

  const protocol: { id: string; title: string; description: string }[] = [];
  const steps: { id: string; title: string; description: string }[] = [];

  // Handlers
  const handleSidebarItemClick = (label: string) => {
    setActiveItem(label);
  };

  const handleLeftTabChange = (tabId: string) => {
    setActiveLeftTab(tabId);
  };

  const handleRightTabChange = (tabId: string) => {
    setActiveRightTab(tabId);
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

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId === selectedTemplate ? null : templateId);
  };

  const handleUseTemplate = (templateId: string) => {
    console.log(`Using template: ${templateId}`);
  };

  const handleViewTemplate = (templateId: string) => {
    console.log(`Viewing template: ${templateId}`);
  };

  return (
    <div className="flex flex-col w-screen h-screen">
      <MainNavbar organization={organization} />

      <div className="flex flex-1 overflow-hidden">

        <SidebarProvider className="min-h-0 flex-1 w-full">
          <MainSidebar
            items={sidebarItems}
            activeItem={activeItem}
            onItemClick={handleSidebarItemClick}
          />

          <div className="bg-card rounded-lg flex flex-col flex-1 overflow-hidden">
            <Separator />
            <MainHeader
              hostname={hostname}
              userProfile={userProfile}
              onHomeClick={handleHomeClick}
              onSettingsClick={handleSettingsClick}
              onUserProfileClick={handleUserProfileClick}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex flex-col flex-1 overflow-hidden">
                <div style={{ display: "flex", height: "100%" }}>
                  <div className="w-[360px] h-full flex flex-col py-4 px-6 overflow-hidden max-h-full">
                    <MainTabBar
                      tabs={leftTabs}
                      value={activeLeftTab}
                      onChange={handleLeftTabChange}
                    />
                  {activeLeftTab === "templates" && (
                    <>
                      <div className="flex justify-between items-center py-6">
                        <h2 className="text-xl font-medium m-0">Templates</h2>
                        <div className="flex gap-2">
                          <Button
                            className="rounded-[4px] w-8 h-8"
                            variant="destructive"
                            size="icon-sm"
                            aria-label="Delete"
                          >
                            <Trash2 size={20} />
                          </Button>
                          <Button
                            className="rounded-[4px] w-8 h-8"
                            size="icon-sm"
                            aria-label="Add"
                          >
                            <Plus size={20} />
                          </Button>
                        </div>
                      </div>

                      <ScrollArea className="flex-1 h-full">
                        {templates.length > 0 ? (
                          templates.map((template) => (
                            <div
                              key={template.id}
                              className="cursor-pointer p-1 last:border-b-0"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleTemplateClick(template.id);
                                }
                              }}
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <TemplateSidebarCard
                                title={template.title}
                                description={template.description}
                                buttonText={template.buttonText}
                                linkText={template.linkText}
                                status={
                                  selectedTemplate === template.id
                                    ? "active"
                                    : "default"
                                }
                                onButtonClick={() =>
                                  handleUseTemplate(template.id)
                                }
                                onLinkClick={() =>
                                  handleViewTemplate(template.id)
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col justify-center items-center gap-4">
                            <Inbox size={40} />
                            <div className="text-sm font-medium">No data</div>
                          </div>
                        )}
                      </ScrollArea>
                    </>
                  )}

                  {activeLeftTab === "protocol" && (
                    <>
                      <div className="flex justify-between items-center py-6">
                        <h2 className="text-xl font-medium m-0">
                          Protocol ({protocol.length})
                        </h2>
                      </div>
                      <div className="flex flex-col overflow-y-auto flex-1 mt-2 max-h-[calc(100vh-240px)]">
                        {protocol.length > 0 ? (
                          protocol.map((template) => (
                            <div
                              key={template.id}
                              className="cursor-pointer last:border-b-0"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleTemplateClick(template.id);
                                }
                              }}
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <TemplateSidebarCard
                                title={template.title}
                                description={template.description}
                                status={
                                  selectedTemplate === template.id
                                    ? "active"
                                    : "default"
                                }
                                onButtonClick={() =>
                                  handleUseTemplate(template.id)
                                }
                                onLinkClick={() =>
                                  handleViewTemplate(template.id)
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col justify-center items-center gap-4">
                            <Inbox size={40} />
                            <div className="text-sm font-medium">No data</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeLeftTab === "steps" && (
                    <>
                      <div className="flex justify-between items-center py-6">
                        <h2 className="text-xl font-medium m-0">
                          Task Scripts ({steps.length})
                        </h2>
                      </div>
                      <div className="flex flex-col overflow-y-auto flex-1 mt-2 max-h-[calc(100vh-240px)]">
                        {protocol.length > 0 ? (
                          protocol.map((template) => (
                            <div
                              key={template.id}
                              className="cursor-pointer last:border-b-0"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleTemplateClick(template.id);
                                }
                              }}
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <TemplateSidebarCard
                                title={template.title}
                                description={template.description}
                                status={
                                  selectedTemplate === template.id
                                    ? "active"
                                    : "default"
                                }
                                onButtonClick={() =>
                                  handleUseTemplate(template.id)
                                }
                                onLinkClick={() =>
                                  handleViewTemplate(template.id)
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col justify-center items-center gap-4">
                            <Inbox size={40} />
                            <div className="text-sm font-medium">No data</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex-1 h-full flex flex-col">
                  <div className="pt-4 px-6 pb-0">
                    <MainTabBar
                      tabs={rightTabs}
                      value={activeRightTab}
                      onChange={handleRightTabChange}
                    />
                  </div>
                  <div className="p-6 -mt-px flex-1">
                    {activeRightTab === "pipelineBuilder" && (
                      <div className="h-full border rounded-lg overflow-hidden">
                        {/* <ReactFlowProvider>
                          <PipelineBuilder width="100%" height="100%" />
                        </ReactFlowProvider> */}
                      </div>
                    )}
                    {activeRightTab === "configuration" && (
                      <ProtocolConfigurationPanel />
                    )}
                    {activeRightTab === "launch" && <LaunchContentPanel />}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default Main;
