import { Home, Settings } from "lucide-react";
import React from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface UserProfileInfo {
  name: string;
  avatar?: string;
}

export interface MainHeaderProps {
  hostname: string;
  userProfile: UserProfileInfo;
  onHomeClick?: () => void;
  onSettingsClick?: () => void;
  onUserProfileClick?: () => void;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);

export const MainHeader: React.FC<MainHeaderProps> = ({
  hostname,
  userProfile,
  onHomeClick,
  onSettingsClick,
  onUserProfileClick,
}) => (
  <div className="flex items-center justify-between w-full px-7 py-4 box-border">
    <div>{hostname}</div>

    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon-sm" onClick={onHomeClick} aria-label="Home">
        <Home size={20} />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onSettingsClick}
        aria-label="Settings"
      >
        <Settings size={20} />
      </Button>
      <div className="h-5 w-px" />
      <Avatar onClick={onUserProfileClick}>
        <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
        <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
      </Avatar>
      <div>{userProfile.name}</div>
    </div>
  </div>
);
