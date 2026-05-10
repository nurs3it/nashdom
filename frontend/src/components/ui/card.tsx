import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col gap-6 text-card-foreground border transition-shadow duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "bg-card border-border shadow-sm",
        muted:   "bg-secondary border-transparent shadow-none",
        outline: "bg-transparent border-border shadow-none",
        accent:  "bg-terra-50 border-terra-100 dark:bg-sand-850 dark:border-sand-700 shadow-none",
      },
      radius: {
        md: "rounded-lg",
        lg: "rounded-xl",
        xl: "rounded-2xl",
      },
      interactive: {
        true:  "cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "md",
      interactive: false,
    },
  }
)

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>

function Card({ className, variant, radius, interactive, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn("py-6", cardVariants({ variant, radius, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-6", className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
