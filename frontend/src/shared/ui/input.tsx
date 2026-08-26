import * as React from "react";

import { cn } from "@/shared/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        [
          "flex h-11 w-full rounded-md border border-line bg-white px-3 py-2",
          "text-sm text-ink outline-none transition-colors duration-200",
          "placeholder:text-ink-muted",
          "focus:border-brand-turquoise focus:ring-4 focus:ring-brand-turquoise/15",
          "disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export { Input };
