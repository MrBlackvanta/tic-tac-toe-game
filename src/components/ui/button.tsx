import type { ComponentProps } from "react";
import { buttonClassName, type ButtonStyle } from "./button-styles";

type ButtonProps = ComponentProps<"button"> & ButtonStyle;

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
      className={`${buttonClassName({ variant, size })} ${className}`}
      {...props}
    />
  );
}
