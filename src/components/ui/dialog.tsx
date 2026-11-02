import type { ComponentProps } from "react";

export default function Dialog({
  className = "",
  ...props
}: ComponentProps<"dialog">) {
  return (
    <dialog
      className={`m-auto min-h-57 w-full max-w-none content-center bg-surface px-2 text-center text-muted backdrop:bg-black/50 open:grid motion-safe:backdrop:transition-colors md:min-h-66.5 starting:backdrop:bg-transparent ${className}`}
      {...props}
    />
  );
}
