import React, { useState } from "react";
// import { ReactFlowProvider } from "@xyflow/react";
import "./Main.scss";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import { AppHeader } from "@molecules/AppHeader";
import { CardSidebar } from "@molecules/CardSidebar";
// import {PipelineBuilder} from "./pipeline-builder";
import { LaunchContent } from "@molecules/LaunchContent";
import { Navbar } from "@molecules/Navbar";
import { ProtocolConfiguration } from "@molecules/ProtocolConfiguration";
import { Sidebar } from "@molecules/Sidebar";
import { TabGroup } from "@molecules/TabGroup";

interface MainProps {
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
}

const Main: React.FC<MainProps> = ({ userProfile, hostname, organization }) => {
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

  // Tabs for the first tab group (left side)
  const leftTabs = [
    { id: "templates", label: "Templates" },
    { id: "protocol", label: "Protocol" },
    { id: "steps", label: "Steps" },
  ];

  // Tabs for the second tab group (right side)
  const rightTabs = [
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
    <div className="main-container">
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

          <div className="container-with-tabs">
            <div className="main-tabs-container">
              <div className="main-layout">
                <div className="left-side">
                  <TabGroup
                    tabs={leftTabs}
                    activeTab={activeLeftTab}
                    onChange={handleLeftTabChange}
                  />
                  {activeLeftTab === "templates" && (
                    <>
                      <div className="templates-header">
                        <h2 className="templates-title">Templates</h2>
                        <div className="buttons-container">
                          <Button
                            className="icon-button"
                            variant="tertiary"
                            size="small"
                            aria-label="Delete"
                            noPadding
                          >
                            <Icon
                              name={IconName.TRASH}
                              width="20"
                              height="20"
                              fill="var(--red-error)"
                            />
                          </Button>
                          <Button
                            className="icon-button"
                            variant="primary"
                            size="small"
                            aria-label="Add"
                            noPadding
                          >
                            <Icon
                              name={IconName.PLUS}
                              width="20"
                              height="20"
                              fill="var(--white-900)"
                            />
                          </Button>
                        </div>
                      </div>

                      <div className="templates-list">
                        {templates.length > 0 ? (
                          templates.map((template) => (
                            <div
                              key={template.id}
                              className="template-card-container"
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <CardSidebar
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
                          <div className="empty-state-container">
                            <Icon
                              name={IconName.INBOX}
                              width="40"
                              height="40"
                              fill="var(--grey-400)"
                            />
                            <div className="empty-state-text">No data</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeLeftTab === "protocol" && (
                    <>
                      <div className="templates-header">
                        <h2 className="templates-title">
                          Protocol ({protocol.length})
                        </h2>
                      </div>
                      <div className="templates-list">
                        {protocol.length > 0 ? (
                          protocol.map((template) => (
                            <div
                              key={template.id}
                              className="template-card-container"
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <CardSidebar
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
                          <div className="empty-state-container">
                            <Icon
                              name={IconName.INBOX}
                              width="40"
                              height="40"
                              fill="var(--grey-400)"
                            />
                            <div className="empty-state-text">No data</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeLeftTab === "steps" && (
                    <>
                      <div className="templates-header">
                        <h2 className="templates-title">
                          Task Scripts ({steps.length})
                        </h2>
                      </div>
                      <div className="templates-list">
                        {protocol.length > 0 ? (
                          protocol.map((template) => (
                            <div
                              key={template.id}
                              className="template-card-container"
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <CardSidebar
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
                          <div className="empty-state-container">
                            <Icon
                              name={IconName.INBOX}
                              width="40"
                              height="40"
                              fill="var(--grey-400)"
                            />
                            <div className="empty-state-text">No data</div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="right-side">
                  <div className="right-side-tab-group-container">
                    <TabGroup
                      tabs={rightTabs}
                      activeTab={activeRightTab}
                      onChange={handleRightTabChange}
                    />
                  </div>
                  <div className="content-wrapper">
                    {activeRightTab === "pipelineBuilder" && (
                      <div className="pipeline-wrapper">
                        {/* <ReactFlowProvider>
                          <PipelineBuilder width="100%" height="100%" />
                        </ReactFlowProvider> */}
                      </div>
                    )}
                    {activeRightTab === "configuration" && (
                      <ProtocolConfiguration />
                    )}
                    {activeRightTab === "launch" && <LaunchContent />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Main };
export type { MainProps };
