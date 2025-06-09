import React from "react";
import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { Dropdown, DropdownOption } from "@atoms/Dropdown";
import { Toggle } from "@atoms/Toggle";
import "./ProtocolYamlCard.scss";

interface ProtocolYamlCardProps {
  title: string;
  newVersionMode: boolean;
  onToggleNewVersionMode: (checked: boolean) => void;
  versionOptions: DropdownOption[];
  selectedVersion: string;
  onVersionChange: (value: string) => void;
  onDeploy: () => void;
  yaml: string;
  onYamlChange: (value: string) => void;
}

const ProtocolYamlCard: React.FC<ProtocolYamlCardProps> = ({
  title,
  newVersionMode,
  onToggleNewVersionMode,
  versionOptions,
  selectedVersion,
  onVersionChange,
  onDeploy,
  yaml,
  onYamlChange,
}) => {
  return (
    <div className="protocol-yaml-card__container">
      <div className="protocol-yaml-card__header">
        <span className="protocol-yaml-card__title">{title}</span>
        <div className="protocol-yaml-card__controls">
          <Toggle
            className="protocol-yaml-card__toggle"
            checked={newVersionMode}
            onChange={onToggleNewVersionMode}
            label="New Version Mode"
          />
          <div className="protocol-yaml-card__divider" />
          <Dropdown
            options={versionOptions}
            value={selectedVersion}
            onChange={onVersionChange}
            size="small"
            width="120px"
          />
          <Button variant="primary" size="medium" onClick={onDeploy}>
            Deploy
          </Button>
        </div>
      </div>
      <div className="protocol-yaml-card__editor-container">
        <CodeEditor
          value={yaml}
          onChange={(v) => onYamlChange(v ?? "")}
          language="yaml"
          theme="light"
          onCopy={() => {}}
          onLaunch={() => {}}
        />
      </div>
    </div>
  );
};

export { ProtocolYamlCard };
export type { ProtocolYamlCardProps };
