import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight",
    "transition-[background-color,color,box-shadow,transform] duration-150 ease-out",
    "active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "aria-invalid:ring-2 aria-invalid:ring-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-terra-600 dark:hover:bg-terra-300",
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:bg-ochre-500 dark:hover:bg-ochre-400",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-sand-200 dark:hover:bg-sand-700",
        outline:
          "border border-border bg-card text-foreground shadow-sm hover:bg-sand-100 hover:border-sand-300 dark:hover:bg-sand-800 dark:hover:border-sand-600",
        ghost:
          "text-foreground hover:bg-sand-100 dark:hover:bg-sand-800",
        link:
          "text-primary underline-offset-4 hover:underline px-0 h-auto active:scale-100",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
        success:
          "bg-success text-white shadow-sm hover:opacity-90",
      },
      size: {
        sm:   "h-9 rounded-md px-3 text-[13px] gap-1.5 has-[>svg]:px-2.5",
        default: "h-10 rounded-md px-4 text-[14px] has-[>svg]:px-3.5",
        lg:   "h-12 rounded-lg px-6 text-[15px] has-[>svg]:px-5",
        xl:   "h-14 rounded-lg px-8 text-[16px] gap-2.5 has-[>svg]:px-7 [&_svg:not([class*='size-'])]:size-5",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-9 w-9 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
