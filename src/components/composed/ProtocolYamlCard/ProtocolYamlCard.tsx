import React from "react";

import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export interface ProtocolYamlCardProps {
  title: string;
  newVersionMode: boolean;
  onToggleNewVersionMode: (checked: boolean) => void;
  versionOptions: { value: string; label: string }[];
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
    <div className="flex flex-col items-start p-0 gap-4 w-[928px] bg-transparent">
      <div className="flex flex-row justify-between items-center w-[928px] h-9">
        <span className="font-semibold text-lg leading-7">{title}</span>
        <div className="flex flex-row items-center gap-4 justify-end">
          <Switch
            checked={newVersionMode}
            onCheckedChange={onToggleNewVersionMode}
          />
          <Label htmlFor="new-version-mode-switch">New Version Mode</Label>
          <div className="w-px h-5" />
          <Select value={selectedVersion} onValueChange={onVersionChange}>
            <SelectTrigger size="default">
              <SelectValue placeholder="Choose a version" />
            </SelectTrigger>
            <SelectContent>
              {versionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onDeploy}>
            Deploy
          </Button>
        </div>
      </div>
      <div className="w-full">
        <CodeEditor
          value={yaml}
          onChange={(v) => onYamlChange(v ?? "")}
          language="yaml"
          onCopy={() => {}}
          onLaunch={() => {}}
        />
      </div>
    </div>
  );
};

export default ProtocolYamlCard;
