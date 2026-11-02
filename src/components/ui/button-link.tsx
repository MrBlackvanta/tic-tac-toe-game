import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonClassName, type ButtonStyle } from "./button-styles";

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyle;

export default function ButtonLink({
  variant,
  size,
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={`grid place-items-center ${buttonClassName({ variant, size })} ${className}`}
      {...props}
    />
  );
}
