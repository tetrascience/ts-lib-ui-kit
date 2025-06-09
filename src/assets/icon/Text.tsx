import React from "react";
import { IconProps } from "@atoms/Icon";

const Text: React.FC<IconProps> = ({
  fill = "currentColor",
  width = "20",
  height = "20",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M13 1H1"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 13V1"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Text;
