import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1 w-fit whitespace-nowrap shrink-0 overflow-hidden",
    "border font-medium leading-none",
    "transition-colors",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-terra-600 dark:[a&]:hover:bg-terra-300",
        accent:
          "border-transparent bg-accent text-accent-foreground [a&]:hover:bg-ochre-500 dark:[a&]:hover:bg-ochre-400",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-sand-200 dark:[a&]:hover:bg-sand-700",
        outline:
          "border-border bg-card text-foreground [a&]:hover:bg-sand-100 dark:[a&]:hover:bg-sand-800",
        soft:
          "border-transparent bg-terra-100 text-terra-800 dark:bg-terra-700/40 dark:text-terra-200",
        success:
          "border-transparent bg-success/15 text-success dark:bg-success/25 dark:text-[#7FD8A6]",
        warning:
          "border-transparent bg-ochre-400/20 text-ochre-500 dark:bg-ochre-300/25 dark:text-ochre-300",
        destructive:
          "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/25 dark:text-[#F0907A]",
        info:
          "border-transparent bg-info/15 text-info dark:bg-info/25 dark:text-[#9CC3D3]",
      },
      size: {
        sm: "h-5 px-2 text-[11px] rounded-md",
        md: "h-6 px-2.5 text-xs rounded-md",
        lg: "h-7 px-3 text-sm rounded-lg",
      },
      shape: {
        rounded: "",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "rounded",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, shape }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
