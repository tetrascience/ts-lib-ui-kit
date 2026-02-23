import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { Dropdown } from "@atoms/Dropdown";
import { Toast } from "@atoms/Toast";
import { Toggle } from "@atoms/Toggle";
import React, { useState } from "react";
import styled from "styled-components";

/** Toast display duration in milliseconds */
const TOAST_DISPLAY_MS = 5000;
/** Deploy simulation delay in milliseconds */
const DEPLOY_DELAY_MS = 3000;

export interface LaunchContentProps {
  initialCode?: string;
  onDeploy?: () => void;
  versions?: string[];
  currentVersion?: string;
  onVersionChange?: (version: string) => void;
}

const Container = styled.div``;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  background-color: var(--grey-100);
`;

const Title = styled.h1`
  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 28px;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const VersionContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Separator = styled.div`
  width: 1px;
  height: 20px;
  background-color: var(--grey-200);
`;

const defaultInitialCode = `protocolSchema: v3
name: v3
description: No description
config: {}
steps: []`;

const ToastWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  margin-bottom: 16px;
`;

const LaunchContent: React.FC<LaunchContentProps> = ({
  initialCode = defaultInitialCode,
  onDeploy,
  versions = ["v0.0.7", "v0.0.6", "v0.0.5"],
  currentVersion = "v0.0.7",
  onVersionChange = () => {},
}) => {
  const [code, setCode] = useState(initialCode);
  const [overwriteMode, setOverwriteMode] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [infoToast, setInfoToast] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleLaunch = (code: string) => {
    console.log("Launching code:", code);
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    setInfoToast(true);
    setSuccessToast(false);
    setErrorToast(false);

    setTimeout(() => {
      setInfoToast(false);

      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        setSuccessToast(true);
        setErrorToast(false);
      } else {
        setSuccessToast(false);
        setErrorToast(true);
      }

      setIsDeploying(false);

      if (onDeploy) onDeploy();

      setTimeout(() => {
        setSuccessToast(false);
        setErrorToast(false);
      }, TOAST_DISPLAY_MS);
    }, DEPLOY_DELAY_MS);
  };

  return (
    <Container>
      <Header>
        <Title>Launch</Title>
        <Controls>
          <Toggle
            checked={overwriteMode}
            onChange={setOverwriteMode}
            label="Overwrite Mode"
            disabled={isDeploying}
          />

          <Separator />
          <VersionContainer>
            <Dropdown
              options={versions.map((v) => ({ label: v, value: v }))}
              value={currentVersion}
              onChange={(value) => onVersionChange(value as string)}
              width="150px"
              size="small"
              disabled={isDeploying}
            />
          </VersionContainer>

          <Button
            variant="primary"
            size="medium"
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            Deploy
          </Button>
        </Controls>
      </Header>

      {infoToast && (
        <ToastWrapper>
          <Toast
            type="info"
            heading="Building Protocol: Status=IN_PROGRESS, Phase=FINALIZING"
          />
        </ToastWrapper>
      )}

      {successToast && (
        <ToastWrapper>
          <Toast
            type="success"
            heading={`Pipeline visual-pipeline-builder-protocol-${currentVersion}-pipeline deployed successfully! Deployment complete`}
          />
        </ToastWrapper>
      )}

      {errorToast && (
        <ToastWrapper>
          <Toast
            type="danger"
            heading={`Failed to deploy pipeline visual-pipeline-builder-protocol-${currentVersion}-pipeline. Please try again.`}
          />
        </ToastWrapper>
      )}

      <CodeEditor
        value={code}
        onChange={handleCodeChange}
        language="yaml"
        theme="light"
        width="100%"
        onCopy={handleCopy}
        onLaunch={handleLaunch}
        disabled={!overwriteMode}
      />
    </Container>
  );
};

export default LaunchContent;
