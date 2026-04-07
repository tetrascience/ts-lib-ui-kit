import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-black/15 dark:bg-white/15",
        "[mask-image:-webkit-radial-gradient(white,black)]",
        "before:absolute before:inset-0 before:will-change-transform",
        "before:animate-[shimmer_2s_linear_0.5s_infinite_backwards]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
        "dark:before:via-white/10",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
