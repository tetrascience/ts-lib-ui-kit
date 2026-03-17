import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

/** Deploy simulation delay in milliseconds */
const DEPLOY_DELAY_MS = 3000;

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
}) => {
  const [code, setCode] = useState(initialCode);
  const [overwriteMode, setOverwriteMode] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);

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

      if (onDeploy) onDeploy();
    }, DEPLOY_DELAY_MS);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-default text-lg font-semibold leading-7 m-0">Launch</h1>
        <div className="flex items-center gap-4">
          <Label htmlFor="overwrite-switch">Overwrite Mode</Label>
          <Switch checked={overwriteMode} onCheckedChange={setOverwriteMode} disabled={isDeploying} />

          <Separator orientation="vertical" />
          <div className="flex items-center">
            <Select defaultValue="workspace">
              <SelectTrigger size="default">
                <SelectValue placeholder="Choose a destination" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleDeploy} disabled={isDeploying}>
            Deploy
          </Button>
        </div>
      </div>

      <CodeEditor
        value={code}
        onChange={handleCodeChange}
        language="yaml"
        width="100%"
        onCopy={handleCopy}
        onLaunch={handleLaunch}
        disabled={!overwriteMode}
      />
    </div>
  );
};

export default LaunchContent;
