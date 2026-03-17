import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const DEPLOY_DELAY_MS = 3000;
const DEFAULT_INITIAL_CODE = `protocolSchema: v3
name: v3
description: No description
config: {}
steps: []`;

export const LaunchContentPanel: React.FC = () => {
  const versions = ["v0.0.7", "v0.0.6", "v0.0.5"];
  const [code, setCode] = useState(DEFAULT_INITIAL_CODE);
  const [currentVersion, setCurrentVersion] = useState(versions[0]);
  const [overwriteMode, setOverwriteMode] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    toast.info("Building Protocol: Status=IN_PROGRESS, Phase=FINALIZING");

    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;

      if (isSuccess) {
        toast.success(
          `Pipeline visual-pipeline-builder-protocol-${currentVersion}-pipeline deployed successfully! Deployment complete`
        );
      } else {
        toast.error(
          `Failed to deploy pipeline visual-pipeline-builder-protocol-${currentVersion}-pipeline. Please try again.`
        );
      }

      setIsDeploying(false);
    }, DEPLOY_DELAY_MS);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="m-0">Launch</h1>
        <div className="flex items-center gap-4">
          <Label htmlFor="overwrite-switch">Overwrite Mode</Label>
          <Switch
            checked={overwriteMode}
            onCheckedChange={setOverwriteMode}
            disabled={isDeploying}
          />
          <Separator orientation="vertical" />
          <Select value={currentVersion} onValueChange={setCurrentVersion}>
            <SelectTrigger size="default" className="w-[180px]">
              <SelectValue placeholder="Choose a version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleDeploy} disabled={isDeploying}>
            Deploy
          </Button>
        </div>
      </div>

      <CodeEditor
        value={code}
        onChange={(value) => setCode(value ?? "")}
        language="yaml"
        theme="light"
        width="100%"
        onCopy={(value) => navigator.clipboard.writeText(value)}
        onLaunch={(value) => console.log("Launching code:", value)}
        disabled={!overwriteMode}
      />
    </div>
  );
};
