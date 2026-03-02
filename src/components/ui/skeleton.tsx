import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Phase 20.2: Match skeleton variant to parent background */
  variant?: 'default' | 'card' | 'dark';
}

function Skeleton({
  className,
  variant = 'default',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        variant === 'default' && "bg-muted",
        variant === 'card' && "bg-muted/60",
        variant === 'dark' && "bg-foreground/10",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
