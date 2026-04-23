import { motion } from "motion/react";
import { memo, useMemo } from "react";

import type { MotionProps } from "motion/react";
import type { CSSProperties, ElementType, JSX } from "react";


import { cn } from "@/lib/utils";

type MotionHTMLProps = MotionProps & Record<string, unknown>;

// Cache motion components at module level to avoid creating during render
const motionComponentCache = new Map<
  keyof JSX.IntrinsicElements,
  React.ComponentType<MotionHTMLProps>
>();

const getMotionComponent = (element: keyof JSX.IntrinsicElements) => {
  let component = motionComponentCache.get(element);
  if (!component) {
    component = motion.create(element);
    motionComponentCache.set(element, component);
  }
  return component;
};

/** TetraScience brand gradient — Light Blue 300 → Purple 500 → Violet Marble */
export const TS_SHIMMER_GRADIENT =
  "linear-gradient(90deg, #549DFF, #8243BA, #9665F4)";

export interface TextShimmerProps {
  children: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
  /**
   * CSS gradient used as the base text colour. Defaults to `muted-foreground`.
   * Pass `TS_SHIMMER_GRADIENT` (or any custom gradient) to colour the text
   * with the brand blue→purple sweep.
   */
  gradient?: string;
}

const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
  gradient,
}: TextShimmerProps) => {
  const MotionComponent = getMotionComponent(
    Component as keyof JSX.IntrinsicElements
  );

  const dynamicSpread = useMemo(
    () => (children?.length ?? 0) * spread,
    [children, spread]
  );

  const baseGradient = gradient
    ? gradient
    : "linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))";

  return (
    <MotionComponent
      animate={{ backgroundPosition: "0% center" }}
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
        className
      )}
      initial={{ backgroundPosition: "100% center" }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          backgroundImage: `var(--bg), ${baseGradient}`,
        } as CSSProperties
      }
      transition={{
        duration,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
    >
      {children}
    </MotionComponent>
  );
};

export const Shimmer = memo(ShimmerComponent);
