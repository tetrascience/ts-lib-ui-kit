import React from "react";
import { IconProps } from "@atoms/Icon";

const Cube: React.FC<IconProps> = ({
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
        d="M10.362 1.093C10.2511 1.0319 10.1266 0.999851 10 0.999851C9.87341 0.999851 9.74887 1.0319 9.638 1.093L2.523 5.018L10 9.143L17.477 5.018L10.362 1.093ZM18 6.443L10.75 10.443V18.693L17.612 14.907C17.7295 14.8422 17.8275 14.7471 17.8958 14.6315C17.964 14.516 18 14.3842 18 14.25V6.443ZM9.25 18.693V10.443L2 6.443V14.25C1.99997 14.3842 2.03596 14.516 2.10421 14.6315C2.17245 14.7471 2.27046 14.8422 2.388 14.907L9.25 18.693Z"
        fill={fill}
      />
    </svg>
  );
};

export default Cube;
