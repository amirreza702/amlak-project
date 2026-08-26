import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-semibold transition-colors duration-200",
    "outline-none focus-visible:ring-4 focus-visible:ring-brand-turquoise/25",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-brand-navy text-white shadow-card hover:bg-brand-navy-deep",
        turquoise:
          "bg-brand-turquoise text-white shadow-card hover:bg-[#067d8c]",
        outline:
          "border border-brand-navy bg-transparent text-brand-navy hover:bg-brand-turquoise-light",
        ghost:
          "bg-transparent text-brand-navy hover:bg-brand-turquoise-light",
        destructive:
          "bg-danger text-white hover:bg-[#a6342f]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
