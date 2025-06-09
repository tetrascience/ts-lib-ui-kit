import React from "react";
import { IconProps } from "@atoms/Icon";

const Database: React.FC<IconProps> = ({
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1C13.866 1 17 2.79 17 5C17 7.21 13.866 9 10 9C6.134 9 3 7.21 3 5C3 2.79 6.134 1 10 1ZM15.694 9.13C16.158 8.866 16.604 8.547 17 8.178V10C17 12.21 13.866 14 10 14C6.134 14 3 12.21 3 10V8.178C3.396 8.548 3.842 8.866 4.306 9.131C5.838 10.006 7.854 10.5 10 10.5C12.146 10.5 14.162 10.006 15.694 9.13ZM3 13.179V15C3 17.21 6.134 19 10 19C13.866 19 17 17.21 17 15V13.178C16.604 13.548 16.158 13.866 15.694 14.131C14.162 15.006 12.146 15.5 10 15.5C7.854 15.5 5.838 15.006 4.306 14.13C3.83547 13.8644 3.39722 13.5453 3 13.179Z"
        fill={fill}
      />
    </svg>
  );
};

export default Database;
