import * as React from "react";

import { cn } from "@/shared/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium leading-6 text-brand-navy",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
