import * as React from "react"

import { cn } from "@/lib/utils"

export interface TetraMoleculeIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

/**
 * The official TetraScience "molecule" brand mark — four connected nodes in a
 * blue gradient ring. Unlike {@link TetraScienceIcon} (a monochrome
 * `currentColor` chat glyph), this renders the full-colour logo, so it does not
 * follow the surrounding text colour.
 */
const TetraMoleculeIcon = React.forwardRef<SVGSVGElement, TetraMoleculeIconProps>(
  ({ size = 24, className, ...props }, ref) => {
    // useId() contains colons, which are brittle inside SVG url(#…) refs.
    const gradientId = `tetra-molecule-${React.useId().replace(/:/g, "")}`
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 52 52"
        fill="none"
        className={cn("shrink-0", className)}
        {...props}
      >
        <circle cx="26" cy="26" r="25.5" fill="white" stroke={`url(#${gradientId})`} />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M31.185 25.0039C31.185 27.1794 29.4271 28.9429 27.2585 28.9429C25.7901 28.9429 24.51 28.1342 23.8368 26.9369C23.8302 26.924 23.8231 26.9117 23.816 26.8994C23.5075 26.337 23.332 25.6911 23.332 25.0039C23.332 22.8285 25.09 21.065 27.2585 21.065C29.4271 21.065 31.185 22.8285 31.185 25.0039Z"
          fill="#2F45B5"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M35.4529 35.1086C35.4529 37.3234 33.6633 39.1187 31.4555 39.1187C29.2476 39.1187 27.458 37.3234 27.458 35.1086C27.458 33.9696 27.9311 32.9417 28.6913 32.2113C28.6932 32.2094 28.6951 32.2075 28.6975 32.2056C28.7239 32.1805 28.7509 32.1553 28.7783 32.1306C29.1138 31.798 29.3219 31.3367 29.3219 30.826C29.3219 30.3154 29.1157 29.8584 28.7831 29.5262C29.1076 29.4189 29.417 29.2775 29.707 29.1062L29.707 29.1162C29.707 30.1669 30.5197 31.0277 31.5491 31.0999C31.5903 31.1027 31.6314 31.1041 31.6735 31.1046C33.7801 31.218 35.4529 32.9673 35.4529 35.1086Z"
          fill="#2F45B5"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.5432 25.9775C22.4595 25.9651 22.3743 25.9589 22.2873 25.9589C21.44 25.9589 20.7323 26.5583 20.5624 27.3575C20.5563 27.3978 20.5492 27.4377 20.5412 27.4776C20.06 30.0649 17.7969 32.023 15.0781 32.023C12.0084 32.023 9.51953 29.5263 9.51953 26.4468C9.51953 23.3673 12.0084 20.8706 15.0781 20.8706C17.346 20.8706 19.297 22.2336 20.1613 24.1874C20.1632 24.1916 20.1651 24.1959 20.1665 24.2002C20.1783 24.2253 20.1892 24.251 20.2001 24.2766C20.2005 24.278 20.201 24.2794 20.202 24.2809C20.473 24.866 21.0644 25.2718 21.7503 25.2718C21.9949 25.2718 22.2277 25.22 22.4377 25.127C22.4476 25.4179 22.4836 25.7022 22.5432 25.9775Z"
          fill="#2F45B5"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M34.9731 15.7483C34.9731 17.6333 33.4924 19.1718 31.6342 19.2563C31.6243 19.2558 31.6143 19.2558 31.6044 19.2558C31.5623 19.2558 31.5202 19.2572 31.4786 19.2601C30.5968 19.3194 29.8834 19.9957 29.7646 20.8632C29.5139 20.7104 29.2485 20.5794 28.9703 20.474C29.2447 20.176 29.4122 19.7774 29.4122 19.3393C29.4122 18.9013 29.248 18.5107 28.9784 18.2132C28.9751 18.2094 28.9718 18.2061 28.9684 18.2023C28.9538 18.1861 28.9386 18.1705 28.923 18.1548L28.9202 18.152C28.3317 17.5241 27.9717 16.6784 27.9717 15.7483C27.9717 13.8087 29.539 12.2365 31.4724 12.2365C33.4059 12.2365 34.9731 13.8087 34.9731 15.7483Z"
          fill="#2F45B5"
        />
        <defs>
          <linearGradient
            id={gradientId}
            x1="44.8086"
            y1="6.34837"
            x2="3.15027"
            y2="49.7655"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5FA3FF" />
            <stop offset="1" stopColor="#003986" />
          </linearGradient>
        </defs>
      </svg>
    )
  }
)

TetraMoleculeIcon.displayName = "TetraMoleculeIcon"

export { TetraMoleculeIcon }
export default TetraMoleculeIcon
