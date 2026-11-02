import type { ComponentProps } from "react";

const VARIANTS = {
  x: "bg-x inset-shadow-x-dark hover:bg-x-light",
  o: "bg-o inset-shadow-o-dark hover:bg-o-light",
  silver: "bg-muted inset-shadow-muted-dark hover:bg-muted-light",
};

const SIZES = {
  lg: "h-14 rounded-lg pb-2 text-heading-xs inset-shadow-lg md:h-16.75 md:text-heading-s",
  sm: "h-13 rounded-md px-4 pb-0.5 text-heading-xs inset-shadow-sm",
};

type ButtonProps = ComponentProps<"button"> & {
  variant: keyof typeof VARIANTS;
  size: keyof typeof SIZES;
};

export default function Button({
  variant,
  size,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${VARIANTS[variant]} ${SIZES[size]} text-page uppercase motion-safe:transition-[background-color] ${className}`}
      {...props}
    />
  );
}
