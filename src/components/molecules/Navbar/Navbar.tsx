import React from "react";
import { Icon, IconName } from "@atoms/Icon";
import "./Navbar.scss";

interface OrganizationInfo {
  name: string;
  subtext?: string;
  logo?: React.ReactNode;
}

interface NavbarProps {
  organization: OrganizationInfo;
}

// Default logo component
const DefaultLogo = () => (
  <div
    style={{
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
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
    <div className="navbar__container">
      <div className="navbar__section">
        <div className="navbar__organization-content">
          <div className="navbar__section-title">ORGANIZATION</div>
          <div className="navbar__first-column">
            <div className="navbar__logo-container">
              {organization.logo || <DefaultLogo />}
            </div>
            <div>
              <div className="navbar__organization-name">
                {organization.name}
              </div>
              {organization.subtext && (
                <div className="navbar__organization-subtext">
                  {organization.subtext}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="navbar__section">
        <div className="navbar__organization-content">
          <div className="navbar__section-title">PROJECT</div>
          <div className="navbar__project-selector">
            <div className="navbar__icon-wrapper">
              <DefaultProjectIcon />
            </div>
            <div className="navbar__project-name">Not Selected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Navbar };
export type { NavbarProps };
