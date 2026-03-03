import { Building, Lamp } from "lucide-react";
import React from "react";

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
  <div className="rounded flex items-center justify-center">
    <Building />
  </div>
);

// Default project icon
const DefaultProjectIcon = () => (
  <Lamp />
);

const Navbar: React.FC<NavbarProps> = ({ organization }) => {
  return (
    <div className="flex items-center h-20 w-full pt-3 pr-6 pb-3 pl-32 box-border gap-10">
      <div className="flex items-center h-full">
        <div className="flex flex-col">
          <div className="uppercase mb-0.5 text-[10px] font-medium leading-4 tracking-[0.2px]">
            ORGANIZATION
          </div>
          <div className="flex items-center gap-2 w-80">
            <div className="flex items-center justify-center">
              {organization.logo || <DefaultLogo />}
            </div>
            <div>
              <div className="text-sm font-medium leading-[22px]">
                {organization.name}
              </div>
              {organization.subtext && (
                <div className="text-muted-foreground text-xs italic font-medium leading-4">
                  {organization.subtext}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center h-full">
        <div className="flex flex-col">
          <div className="uppercase mb-0.5 text-[10px] font-medium leading-4 tracking-[0.2px]">
            PROJECT
          </div>
          <div className="flex items-center py-1.5 rounded gap-2">
            <div className="flex items-center justify-center">
              <DefaultProjectIcon />
            </div>
            <div className="text-muted-foreground text-sm font-medium leading-[22px]">
              {"Not Selected"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
