import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[20px] text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white hover:shadow-2xl hover:shadow-purple-500/40 glow-button",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-2xl hover:shadow-red-500/40",
        outline:
          "border-2 border-white/20 bg-transparent hover:bg-gradient-purple/20 hover:text-white hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/20",
        secondary:
          "glass-surface text-white hover:bg-white/20 hover:shadow-2xl hover:shadow-white/10 hover-subtle",
        ghost: "hover:bg-gradient-purple/20 hover:text-white hover:shadow-md transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-purple-400 hover:bg-gradient-purple/10 rounded-[12px] px-3 py-2",
      },
      size: {
        default: "h-12 px-6 py-3 text-sm font-semibold",
        sm: "h-10 rounded-[16px] px-4 py-2 text-xs font-medium",
        lg: "h-16 rounded-[24px] px-8 py-4 text-base font-bold",
        icon: "h-12 w-12 rounded-[20px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
