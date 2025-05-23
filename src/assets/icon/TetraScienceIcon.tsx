import React from "react";
import { IconProps } from "@atoms/Icon";

const TetraScienceIcon: React.FC<IconProps> = ({
  fill = "currentColor",
  width = "21",
  height = "21",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.392 10.5705C21.693 5.4495 17.313 1.5 12 1.5C6.201 1.5 1.5 6.201 1.5 12C1.5 14.064 2.1045 15.9825 3.132 17.6055L1.5 22.5L6.3945 20.868C7.6395 21.657 9.06 22.188 10.584 22.3965"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.625 12.75L18.75 16.5L22.5 17.625L18.75 18.75L17.625 22.5L16.5 18.75L12.75 17.625L16.5 16.5L17.625 12.75Z"
        fill={fill}
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TetraScienceIcon;
