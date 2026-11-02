import { ErrorPanel } from "@/components/layout";
import { ButtonLink } from "@/components/ui";
import { SITE_NAME } from "@/data";
import type { Metadata } from "next";

const description =
  "There’s no board at this address. Head back to start a game, or pick up the one you left.";

export const metadata: Metadata = {
  title: `${SITE_NAME} | Page not found`,
  description,
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <ErrorPanel title="Page not found" description={description}>
      <ButtonLink href="/" variant="o" size="lg">
        Back to the game
      </ButtonLink>
    </ErrorPanel>
  );
}
