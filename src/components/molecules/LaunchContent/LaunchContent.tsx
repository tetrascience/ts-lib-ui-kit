import React, { useState } from "react";
import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { Dropdown } from "@atoms/Dropdown";
import { Toast } from "@atoms/Toast";
import { Toggle } from "@atoms/Toggle";
import "./LaunchContent.scss";

export interface LaunchContentProps {
  initialCode?: string;
  onDeploy?: () => void;
  versions?: string[];
  currentVersion?: string;
  onVersionChange?: (version: string) => void;
}

const defaultInitialCode = `protocolSchema: v3
name: v3
description: No description
config: {}
steps: []`;

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
      }, 5000);
    }, 3000);
  };

  return (
    <div className="launch-content__container">
      <div className="launch-content__header">
        <h1 className="launch-content__title">Launch</h1>
        <div className="launch-content__controls">
          <Toggle
            checked={overwriteMode}
            onChange={setOverwriteMode}
            label="Overwrite Mode"
            disabled={isDeploying}
          />

          <div className="launch-content__separator" />
          <div className="launch-content__version-container">
            <Dropdown
              options={versions.map((v) => ({ label: v, value: v }))}
              value={currentVersion}
              onChange={(value) => onVersionChange(value as string)}
              width="150px"
              size="small"
              disabled={isDeploying}
            />
          </div>

          <Button
            variant="primary"
            size="medium"
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            Deploy
          </Button>
        </div>
      </div>

      {infoToast && (
        <div className="launch-content__toast-wrapper">
          <Toast
            type="info"
            heading="Building Protocol: Status=IN_PROGRESS, Phase=FINALIZING"
          />
        </div>
      )}

      {successToast && (
        <div className="launch-content__toast-wrapper">
          <Toast
            type="success"
            heading={`Pipeline visual-pipeline-builder-protocol-${currentVersion}-pipeline deployed successfully! Deployment complete`}
          />
        </div>
      )}

      {errorToast && (
        <div className="launch-content__toast-wrapper">
          <Toast
            type="danger"
            heading={`Failed to deploy pipeline visual-pipeline-builder-protocol-${currentVersion}-pipeline. Please try again.`}
          />
        </div>
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
    </div>
  );
};

export default LaunchContent;
