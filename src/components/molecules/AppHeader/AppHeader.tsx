import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import React from "react";
import styled from "styled-components";

/** Props for the user profile displayed in the header */
interface UserProfileProps {
  /** Display name of the user */
  name: string;
  /** URL of the user's avatar image */
  avatar?: string;
}

/** Props for the AppHeader component */
export interface AppHeaderProps {
  hostname: string;
  userProfile: UserProfileProps;
  onHomeClick?: () => void;
  onSettingsClick?: () => void;
  onUserProfileClick?: () => void;
}

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: auto;
  width: 100%;
  padding: 16px 28px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--grey-200);
  background-color: var(--white-900);
`;

const HostnameText = styled.div`
  color: var(--black-900);
  font-family: "Inter", sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: var(--grey-100);
  }
`;

const Avatar = styled.div<{ src?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--blue-100);
  background-image: ${(props) => (props.src ? `url(${props.src})` : "none")};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--blue-600);
  font-weight: 500;
  font-size: 14px;
  font-family: "Inter", sans-serif;
`;

const UserName = styled.div`
  font-family: "Inter", sans-serif;
  color: var(--grey-400);
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

const IconButtonStyle = styled(Button)`
  width: 32px;
  height: 32px;
  padding: 0;
  min-height: 0;
  border-radius: 4px;
`;

const Separator = styled.div`
  height: 20px;
  width: 1px;
  background-color: var(--grey-200);
  margin: 0;
`;

/** Application header bar with hostname, user profile, and navigation actions */
export const AppHeader: React.FC<AppHeaderProps> = ({
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
    <HeaderContainer>
      <HostnameText>{hostname}</HostnameText>

      <ActionsContainer>
        <IconButtonStyle
          variant="tertiary"
          size="small"
          onClick={onHomeClick}
          aria-label="Home"
        >
          <Icon
            name={IconName.HOME}
            width="20"
            height="20"
            fill="var(--grey-600)"
          />
        </IconButtonStyle>

        <IconButtonStyle
          variant="tertiary"
          size="small"
          onClick={onSettingsClick}
          aria-label="Settings"
        >
          <Icon
            name={IconName.GEAR}
            width="20"
            height="20"
            fill="var(--grey-600)"
          />
        </IconButtonStyle>

        <Separator />

        <UserProfileContainer onClick={onUserProfileClick}>
          <Avatar src={userProfile.avatar}>
            {!userProfile.avatar && getInitials(userProfile.name)}
          </Avatar>
          <UserName>{userProfile.name}</UserName>
        </UserProfileContainer>
      </ActionsContainer>
    </HeaderContainer>
  );
};

export default AppHeader;
