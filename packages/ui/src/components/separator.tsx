"use client";

import { cn } from "@workspace/ui/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) {
  const baseStyles =
    "bg-stone-300 dark:bg-stone-700 opacity-80 shrink-0 rounded-full";
  const orientationStyles =
    orientation === "horizontal" ? "h-px w-full my-2" : "w-px h-5 mx-2";

  return (
    <div className={cn(baseStyles, orientationStyles, className)} {...props} />
  );
}
