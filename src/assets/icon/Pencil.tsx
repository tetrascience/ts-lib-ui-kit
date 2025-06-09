import React from "react";
import { IconProps } from "@atoms/Icon";

const Pencil: React.FC<IconProps> = ({
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
        d="M2.69533 14.7623L1.43355 17.9168C1.27028 18.3249 1.67532 18.73 2.08348 18.5667L5.23795 17.3049C5.74091 17.1037 6.19777 16.8025 6.58081 16.4194L17.5 5.50072C18.3284 4.67229 18.3284 3.32914 17.5 2.50072C16.6716 1.67229 15.3284 1.67229 14.5 2.50071L3.58081 13.4194C3.19777 13.8025 2.89652 14.2593 2.69533 14.7623Z"
        fill={fill}
      />
    </svg>
  );
};

export default Pencil;
