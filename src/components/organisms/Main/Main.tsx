// import { ReactFlowProvider } from "@xyflow/react";
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
import React, { useState } from "react";
import styled from "styled-components";

/** Props for the Main component */
export interface MainProps {
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

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ContainerWithTabs = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--white-900);
  flex: 1;
  overflow: hidden;
`;

const MainTabsContainer = styled.div`
  border-bottom: 1px solid var(--grey-200);
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const TemplatesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  background-color: var(--white-900);
`;

const TemplatesTitle = styled.h2`
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--black-900);
  margin: 0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled(Button)`
  border-radius: 4px;
  width: 32px;
  height: 32px;
`;

const LeftSide = styled.div`
  width: 360px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  overflow: hidden;
  max-height: 100%;
`;

const RightSide = styled.div`
  flex: 1;
  height: 100%;
  background-color: var(--grey-100);
  display: flex;
  flex-direction: column;
`;

const RightSideTabGroupContainer = styled.div`
  padding: 16px 24px 0 24px;
`;

const TemplatesList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  margin-top: 8px;
  max-height: calc(100vh - 240px);
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
`;

const EmptyStateText = styled.div`
  color: var(--grey-400);
  font-size: 14px;
  font-weight: 500;
`;

const TemplateCardContainer = styled.div`
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
`;

const TemplateCardSidebar = styled(CardSidebar)``;

const ContentWrapper = styled.div`
  padding: 24px;
  margin-top: -1px;
  flex: 1;
  border-top: 1px solid var(--grey-200);
`;

const PipelineWrapper = styled.div`
  height: 100%;
  border: 1px solid var(--grey-200);
  border-radius: 8px;
  overflow: hidden;
`;

/** Full application layout demo component with navigation and content */
export const Main: React.FC<MainProps> = ({ userProfile, hostname, organization }) => {
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
    <MainContainer>
      <Navbar organization={organization} />

      <ContentContainer>
        <Sidebar
          items={sidebarItems}
          activeItem={activeItem}
          onItemClick={handleSidebarItemClick}
        />

        <MainContent>
          <AppHeader
            hostname={hostname}
            userProfile={userProfile}
            onHomeClick={handleHomeClick}
            onSettingsClick={handleSettingsClick}
            onUserProfileClick={handleUserProfileClick}
          />

          <ContainerWithTabs>
            <MainTabsContainer>
              <div style={{ display: "flex", height: "100%" }}>
                <LeftSide>
                  <TabGroup
                    tabs={leftTabs}
                    activeTab={activeLeftTab}
                    onChange={handleLeftTabChange}
                  />
                  {activeLeftTab === "templates" && (
                    <>
                      <TemplatesHeader>
                        <TemplatesTitle>Templates</TemplatesTitle>
                        <ButtonsContainer>
                          <IconButton
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
                          </IconButton>
                          <IconButton
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
                          </IconButton>
                        </ButtonsContainer>
                      </TemplatesHeader>

                      <TemplatesList>
                        {templates.length > 0 ? (
                          templates.map((template) => (
                            <TemplateCardContainer
                              key={template.id}
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <TemplateCardSidebar
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
                            </TemplateCardContainer>
                          ))
                        ) : (
                          <EmptyStateContainer>
                            <Icon
                              name={IconName.INBOX}
                              width="40"
                              height="40"
                              fill="var(--grey-400)"
                            />
                            <EmptyStateText>No data</EmptyStateText>
                          </EmptyStateContainer>
                        )}
                      </TemplatesList>
                    </>
                  )}

                  {activeLeftTab === "protocol" && (
                    <>
                      <TemplatesHeader>
                        <TemplatesTitle>
                          Protocol ({protocol.length})
                        </TemplatesTitle>
                      </TemplatesHeader>
                      <TemplatesList>
                        {protocol.length > 0 ? (
                          protocol.map((template) => (
                            <TemplateCardContainer
                              key={template.id}
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <TemplateCardSidebar
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
                            </TemplateCardContainer>
                          ))
                        ) : (
                          <EmptyStateContainer>
                            <Icon
                              name={IconName.INBOX}
                              width="40"
                              height="40"
                              fill="var(--grey-400)"
                            />
                            <EmptyStateText>No data</EmptyStateText>
                          </EmptyStateContainer>
                        )}
                      </TemplatesList>
                    </>
                  )}

                  {activeLeftTab === "steps" && (
                    <>
                      <TemplatesHeader>
                        <TemplatesTitle>
                          Task Scripts ({steps.length})
                        </TemplatesTitle>
                      </TemplatesHeader>
                      <TemplatesList>
                        {protocol.length > 0 ? (
                          protocol.map((template) => (
                            <TemplateCardContainer
                              key={template.id}
                              onClick={() => handleTemplateClick(template.id)}
                            >
                              <TemplateCardSidebar
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
                            </TemplateCardContainer>
                          ))
                        ) : (
                          <EmptyStateContainer>
                            <Icon
                              name={IconName.INBOX}
                              width="40"
                              height="40"
                              fill="var(--grey-400)"
                            />
                            <EmptyStateText>No data</EmptyStateText>
                          </EmptyStateContainer>
                        )}
                      </TemplatesList>
                    </>
                  )}
                </LeftSide>
                <RightSide>
                  <RightSideTabGroupContainer>
                    <TabGroup
                      tabs={rightTabs}
                      activeTab={activeRightTab}
                      onChange={handleRightTabChange}
                    />
                  </RightSideTabGroupContainer>
                  <ContentWrapper>
                    {activeRightTab === "pipelineBuilder" && (
                      <PipelineWrapper>
                        {/* <ReactFlowProvider>
                          <PipelineBuilder width="100%" height="100%" />
                        </ReactFlowProvider> */}
                      </PipelineWrapper>
                    )}
                    {activeRightTab === "configuration" && (
                      <ProtocolConfiguration />
                    )}
                    {activeRightTab === "launch" && <LaunchContent />}
                  </ContentWrapper>
                </RightSide>
              </div>
            </MainTabsContainer>
          </ContainerWithTabs>
        </MainContent>
      </ContentContainer>
    </MainContainer>
  );
};

export default Main;
