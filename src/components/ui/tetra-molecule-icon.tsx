import * as React from "react"

import { cn } from "@/lib/utils"

export interface TetraMoleculeIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  /**
   * When true, the molecule continuously rotates 360° (the branded
   * "TetraSpin"). The gradient stays fixed while the nodes turn beneath it, so
   * each node shimmers between the light and dark brand blues as it passes.
   */
  spinning?: boolean
}

// TS brand blues: light accent → deep indigo.
const LIGHT = "#549DFF" // TS Light Blue 300
const DARK = "#2F45B5" // TS Indigo

/**
 * The official TetraScience "molecule" brand mark — the four-node symbol from
 * the TetraScience logo, filled with the brand blue gradient. Pass `spinning`
 * to animate it as the branded thinking indicator.
 */
const TetraMoleculeIcon = React.forwardRef<SVGSVGElement, TetraMoleculeIconProps>(
  ({ size = 24, className, spinning = false, ...props }, ref) => {
    // useId() contains colons, which are brittle inside SVG url(#…) refs.
    const gradientId = `tetra-molecule-${React.useId().replace(/:/g, "")}`
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        // Square viewBox padded around the mark's centre (371.5, 378.5) so the
        // marks aren't flush with the edges, and `overflow-visible` so the
        // nodes are never clipped as they sweep through the 360° spin.
        viewBox="166.5 173.5 410 410"
        fill="none"
        className={cn("shrink-0 overflow-visible", className)}
        {...props}
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="188"
            y1="569"
            x2="555"
            y2="188"
          >
            <stop stopColor={LIGHT} />
            <stop offset="1" stopColor={DARK} />
          </linearGradient>
        </defs>
        <g
          className={cn(spinning && "ts-tetra-spin")}
          fill={`url(#${gradientId})`}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <path d="M494.726 368.437C494.726 399.137 469.84 424.023 439.14 424.023C418.353 424.023 400.23 412.611 390.7 395.714C390.607 395.534 390.506 395.36 390.406 395.185C386.039 387.249 383.555 378.135 383.555 368.437C383.555 337.738 408.441 312.852 439.14 312.852C469.84 312.852 494.726 337.738 494.726 368.437Z" />
          <path d="M555 512.095C555 543.351 529.665 568.686 498.41 568.686C467.155 568.686 441.82 543.351 441.82 512.095C441.82 496.022 448.517 481.516 459.279 471.21C459.306 471.183 459.333 471.156 459.366 471.129C459.741 470.774 460.123 470.419 460.511 470.071C465.26 465.376 468.206 458.867 468.206 451.661C468.206 444.455 465.286 438.006 460.578 433.318C465.173 431.804 469.552 429.808 473.658 427.391V427.531C473.658 442.359 485.163 454.507 499.736 455.525C500.319 455.565 500.901 455.585 501.497 455.592C531.32 457.193 555 481.878 555 512.095Z" />
          <path d="M372.37 382.911C371.185 382.737 369.98 382.65 368.747 382.65C356.753 382.65 346.734 391.108 344.33 402.386C344.243 402.955 344.142 403.518 344.028 404.08C337.218 440.593 305.179 468.225 266.691 468.225C223.233 468.225 188 432.992 188 389.534C188 346.077 223.233 310.844 266.691 310.844C298.796 310.844 326.415 330.078 338.651 357.65C338.678 357.71 338.704 357.77 338.724 357.83C338.892 358.185 339.046 358.547 339.2 358.909C339.207 358.929 339.213 358.949 339.227 358.969C343.064 367.226 351.435 372.952 361.146 372.952C364.609 372.952 367.904 372.222 370.877 370.91C371.018 375.015 371.527 379.027 372.37 382.911Z" />
          <path d="M548.302 237.84C548.302 264.44 527.34 286.152 501.034 287.344C500.894 287.338 500.753 287.338 500.612 287.338C500.016 287.338 499.42 287.358 498.831 287.398C486.348 288.235 476.248 297.778 474.567 310.021C471.018 307.864 467.261 306.016 463.323 304.529C467.207 300.323 469.578 294.698 469.578 288.516C469.578 282.335 467.254 276.823 463.437 272.624C463.39 272.571 463.343 272.524 463.296 272.47C463.089 272.242 462.874 272.021 462.653 271.8L462.613 271.76C454.282 262.9 449.186 250.966 449.186 237.84C449.186 210.469 471.373 188.281 498.744 188.281C526.115 188.281 548.302 210.469 548.302 237.84Z" />
        </g>
      </svg>
    )
  }
)

TetraMoleculeIcon.displayName = "TetraMoleculeIcon"

export { TetraMoleculeIcon }
export default TetraMoleculeIcon
