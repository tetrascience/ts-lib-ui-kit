import React from "react";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import "./AppHeader.scss";

interface UserProfileProps {
  name: string;
  avatar?: string;
}

interface AppHeaderProps {
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

  const avatarStyle = userProfile.avatar
    ? { backgroundImage: `url(${userProfile.avatar})` }
    : {};

  return (
    <div className="app-header">
      <div className="app-header__hostname">{hostname}</div>

      <div className="app-header__actions">
        <Button
          variant="tertiary"
          size="small"
          onClick={onHomeClick}
          aria-label="Home"
          className="app-header__icon-button"
        >
          <Icon
            name={IconName.HOME}
            width="20"
            height="20"
            fill="var(--grey-600)"
          />
        </Button>

        <Button
          variant="tertiary"
          size="small"
          onClick={onSettingsClick}
          aria-label="Settings"
          className="app-header__icon-button"
        >
          <Icon
            name={IconName.GEAR}
            width="20"
            height="20"
            fill="var(--grey-600)"
          />
        </Button>

        <div className="app-header__separator" />

        <div className="app-header__user-profile" onClick={onUserProfileClick}>
          <div
            className={`app-header__avatar ${
              userProfile.avatar ? "app-header__avatar--with-image" : ""
            }`}
            style={avatarStyle}
          >
            {!userProfile.avatar && getInitials(userProfile.name)}
          </div>
          <div className="app-header__user-name">{userProfile.name}</div>
        </div>
      </div>
    </div>
  );
};

export { AppHeader };
export type { AppHeaderProps };
