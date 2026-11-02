import type { Mark } from "@/lib";
import type { SVGProps } from "react";
import OIcon from "./o-icon";
import OOutlineIcon from "./o-outline-icon";
import XIcon from "./x-icon";
import XOutlineIcon from "./x-outline-icon";

type MarkIconProps = SVGProps<SVGSVGElement> & {
  mark: Mark;
  outline?: boolean;
};

export default function MarkIcon({
  mark,
  outline = false,
  ...props
}: MarkIconProps) {
  if (outline) {
    return mark === "x" ? (
      <XOutlineIcon {...props} />
    ) : (
      <OOutlineIcon {...props} />
    );
  }
  return mark === "x" ? <XIcon {...props} /> : <OIcon {...props} />;
}
