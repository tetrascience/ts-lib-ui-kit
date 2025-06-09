import React from "react";
import { IconProps } from "@atoms/Icon";

const Sitemap: React.FC<IconProps> = ({
  fill = "currentColor",
  width = "20",
  height = "20",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 16"
      fill="none"
    >
      <path
        d="M7 5V8"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 11V9C3 8.4477 3.4477 8 4 8H10C10.5523 8 11 8.4477 11 9V11"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 5C8.10457 5 9 4.10457 9 3C9 1.89543 8.10457 1 7 1C5.89543 1 5 1.89543 5 3C5 4.10457 5.89543 5 7 5Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 15C4.10457 15 5 14.1046 5 13C5 11.8954 4.10457 11 3 11C1.89543 11 1 11.8954 1 13C1 14.1046 1.89543 15 3 15Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 15C12.1046 15 13 14.1046 13 13C13 11.8954 12.1046 11 11 11C9.89543 11 9 11.8954 9 13C9 14.1046 9.89543 15 11 15Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sitemap;
