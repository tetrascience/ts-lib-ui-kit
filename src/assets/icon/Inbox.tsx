import React from "react";
import { IconProps } from "@atoms/Icon";

const Inbox: React.FC<IconProps> = ({
  fill = "currentColor",
  width = "20",
  height = "20",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 40 40"
      fill="none"
    >
      <path
        d="M3.75 22.5H10.1824C11.6028 22.5 12.9013 23.3025 13.5365 24.5729L13.9635 25.4271C14.5987 26.6975 15.8972 27.5 17.3176 27.5H22.6824C24.1028 27.5 25.4013 26.6975 26.0365 25.4271L26.4635 24.5729C27.0987 23.3025 28.3972 22.5 29.8176 22.5H36.25M3.75 23.0639V30C3.75 32.0711 5.42893 33.75 7.5 33.75H32.5C34.5711 33.75 36.25 32.0711 36.25 30V23.0639C36.25 22.6901 36.1941 22.3183 36.0842 21.9611L32.0645 8.89718C31.5804 7.32371 30.1266 6.25 28.4803 6.25H11.5197C9.87339 6.25 8.41963 7.32371 7.93548 8.89718L3.91583 21.9611C3.80589 22.3183 3.75 22.6901 3.75 23.0639Z"
        stroke={fill}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Inbox;
