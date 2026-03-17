import { Building, Lamp } from "lucide-react";
import React from "react";

export interface OrganizationInfo {
  name: string;
  subtext?: string;
  logo?: React.ReactNode;
}

export interface MainNavbarProps {
  organization: OrganizationInfo;
}

const DefaultLogo = () => <Building />;
const DefaultProjectIcon = () => <Lamp />;

export const MainNavbar: React.FC<MainNavbarProps> = ({ organization }) => (
  <div className="flex items-center h-20 w-full pt-3 pr-6 pb-3 pl-32 box-border gap-10">
    <div className="flex items-center h-full">
      <div className="flex flex-col">
        <div className="uppercase mb-0.5 tracking-[0.2px]">ORGANIZATION</div>
        <div className="flex items-center gap-2 w-80">
          <div>{organization.logo || <DefaultLogo />}</div>
          <div>
            <div>{organization.name}</div>
            {organization.subtext && (
              <div>{organization.subtext}</div>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center h-full">
      <div className="flex flex-col">
        <div className="uppercase mb-0.5 tracking-[0.2px]">PROJECT</div>
        <div className="flex items-center gap-2">
          <DefaultProjectIcon />
          <div>Not Selected</div>
        </div>
      </div>
    </div>
  </div>
);
