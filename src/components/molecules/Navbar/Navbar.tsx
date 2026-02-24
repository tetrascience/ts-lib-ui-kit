import { Icon, IconName } from "@atoms/Icon";
import React from "react";
import styled from "styled-components";

// Types
interface OrganizationInfo {
  name: string;
  subtext?: string;
  logo?: React.ReactNode;
}

/** Props for the Navbar component */
export interface NavbarProps {
  organization: OrganizationInfo;
}

// Styled components
const NavbarContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--blue-900);
  height: 80px;
  width: 100%;
  padding: 12px 24px 12px 128px;
  box-sizing: border-box;
  color: var(--white-900);
  gap: 40px;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const SectionTitle = styled.div`
  text-transform: uppercase;
  margin-bottom: 2px;
  color: var(--white-900);
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.2px;
  font-family: "Inter", sans-serif;
`;

const OrganizationName = styled.div`
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
  font-family: "Inter", sans-serif;
`;

const OrganizationSubtext = styled.div`
  color: var(--grey-400);
  font-size: 12px;
  font-style: italic;
  font-weight: 500;
  line-height: 16px;
  font-family: "Inter", sans-serif;
`;

const OrganizationContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProjectSelector = styled.div`
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-radius: 4px;
  gap: 8px;
`;

const ProjectName = styled.div`
  font-family: "Inter", sans-serif;
  color: var(--grey-400);
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 22px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FirstColumn = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 320px;
`;

/** Default logo icon used in the Navbar when no custom logo is provided */
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

/** Default project icon used in the Navbar when no custom project icon is provided */
const DefaultProjectIcon = () => (
  <Icon name={IconName.LAMP} fill="var(--white-900)" width="20" height="20" />
);

/** Top navigation bar displaying organization and project info */
export const Navbar: React.FC<NavbarProps> = ({ organization }) => {
  return (
    <NavbarContainer>
      <Section>
        <OrganizationContent>
          <SectionTitle>ORGANIZATION</SectionTitle>
          <FirstColumn>
            <LogoContainer>
              {organization.logo || <DefaultLogo />}
            </LogoContainer>
            <div>
              <OrganizationName>{organization.name}</OrganizationName>
              {organization.subtext && (
                <OrganizationSubtext>
                  {organization.subtext}
                </OrganizationSubtext>
              )}
            </div>
          </FirstColumn>
        </OrganizationContent>
      </Section>

      <Section>
        <OrganizationContent>
          <SectionTitle>PROJECT</SectionTitle>
          <ProjectSelector>
            <IconWrapper>{<DefaultProjectIcon />}</IconWrapper>
            <ProjectName>{"Not Selected"}</ProjectName>
          </ProjectSelector>
        </OrganizationContent>
      </Section>
    </NavbarContainer>
  );
};

export default Navbar;
