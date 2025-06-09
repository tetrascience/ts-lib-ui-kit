import React from "react";
import { IconProps } from "@atoms/Icon";

const Close: React.FC<IconProps> = ({
  fill = "currentColor",
  width = "20",
  height = "20",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M3.75 3.75L16.25 16.25M16.25 3.75L3.75 16.25"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Close;
