import { Plus } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export interface ProtocolConfigurationProps {
  className?: string;
}

const ProtocolConfiguration: React.FC<ProtocolConfigurationProps> = ({
  className,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-6 rounded-tl-3xl rounded-tr-3xl">
        <h2 className="text-xl font-semibold leading-7 m-0">Protocol Configuration</h2>
        <div className="flex items-center gap-2 text-[15px] font-medium">
          <Switch
            checked={isEditMode}
            onCheckedChange={() => setIsEditMode((prev) => !prev)}
          />
          <Label htmlFor="edit-mode-switch">Edit Mode</Label>
        </div>
      </div>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <Button
              variant="secondary"
            >
              <Plus />
              Add Input
            </Button>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <div className="text-muted-foreground text-sm font-medium">
                No values, Use the 'edit' button to add values
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProtocolConfiguration;
