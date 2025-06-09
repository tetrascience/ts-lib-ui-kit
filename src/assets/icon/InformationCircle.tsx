import React from "react";
import { IconProps } from "@atoms/Icon";

const InformationCircle: React.FC<IconProps> = ({
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
        d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM9 9C8.58579 9 8.25 9.33579 8.25 9.75C8.25 10.1642 8.58579 10.5 9 10.5H9.25293C9.41287 10.5 9.53176 10.6486 9.49707 10.8047L9.03809 12.8701C8.79522 13.963 9.62751 15 10.7471 15H11C11.4142 15 11.75 14.6642 11.75 14.25C11.75 13.8358 11.4142 13.5 11 13.5H10.7471C10.5871 13.5 10.4682 13.3514 10.5029 13.1953L10.9619 11.1299C11.2048 10.037 10.3725 9 9.25293 9H9ZM10 5C9.44771 5 9 5.44772 9 6C9 6.55228 9.44771 7 10 7C10.5523 7 11 6.55228 11 6C11 5.44772 10.5523 5 10 5Z"
        fill={fill}
      />
    </svg>
  );
};

export default InformationCircle;
