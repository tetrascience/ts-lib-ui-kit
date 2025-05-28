import React from "react";
import { Icon, IconName } from "@atoms/Icon";
import "./Navbar.less";

// Types
interface OrganizationInfo {
  name: string;
  subtext?: string;
  logo?: React.ReactNode;
}

export interface NavbarProps {
  organization: OrganizationInfo;
}

// Default logo component
const DefaultLogo = () => (
  <div className="navbar-default-logo">
    <Icon
      name={IconName.BUILDING}
      fill="var(--white-900)"
      width="20"
      height="20"
    />
  </div>
);

// Default project icon
const DefaultProjectIcon = () => (
  <Icon name={IconName.LAMP} fill="var(--white-900)" width="20" height="20" />
);

const Navbar: React.FC<NavbarProps> = ({ organization }) => {
  return (
    <div className="navbar-container">
      <div className="navbar-section">
        <div className="navbar-organization-content">
          <div className="navbar-section-title">ORGANIZATION</div>
          <div className="navbar-first-column">
            <div className="navbar-logo-container">
              {organization.logo || <DefaultLogo />}
            </div>
            <div>
              <div className="navbar-organization-name">{organization.name}</div>
              {organization.subtext && (
                <div className="navbar-organization-subtext">
                  {organization.subtext}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-section">
        <div className="navbar-organization-content">
          <div className="navbar-section-title">PROJECT</div>
          <div className="navbar-project-selector">
            <div className="navbar-icon-wrapper">{<DefaultProjectIcon />}</div>
            <div className="navbar-project-name">{"Not Selected"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
