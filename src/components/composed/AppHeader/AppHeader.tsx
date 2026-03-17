import { Settings, Home } from "lucide-react";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface UserProfileProps {
  name: string;
  avatar?: string;
}

export interface AppHeaderProps {
  hostname: string;
  userProfile: UserProfileProps;
  onHomeClick?: () => void;
  onSettingsClick?: () => void;
  onUserProfileClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  hostname,
  userProfile,
  onHomeClick,
  onSettingsClick,
  onUserProfileClick,
}) => {
  // Get initials for avatar placeholder if no image is provided
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className="flex items-center justify-between h-auto w-full px-7 py-4 box-border">
        <div className="text-lg font-medium leading-7">{hostname}</div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon-sm" onClick={onHomeClick} aria-label="Home">
            <Home size={20} />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={onSettingsClick} aria-label="Settings">
            <Settings size={20} />
          </Button>
          <Separator orientation="vertical" />
          <Avatar onClick={onUserProfileClick}>
            <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
            <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
          </Avatar>
          <div className="text-base font-normal leading-6">{userProfile.name}</div>{" "}
        </div>
      </div>
      <Separator />
    </>
  );
};

export default AppHeader;
