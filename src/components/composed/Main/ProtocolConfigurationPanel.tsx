import { Plus } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const ProtocolConfigurationPanel: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between pb-6">
        <h2 className="m-0 text-xl font-semibold leading-7">Protocol Configuration</h2>
        <div className="flex items-center gap-2 text-[15px] font-medium">
          <Switch checked={isEditMode} onCheckedChange={setIsEditMode} />
          <Label htmlFor="edit-mode-switch">Edit Mode</Label>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditMode ? (
            <Button variant="secondary">
              <Plus />
              Add Input
            </Button>
          ) : (
            <div>No values, Use the 'edit' button to add values</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
