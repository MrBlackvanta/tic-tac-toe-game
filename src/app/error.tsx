"use client";

import { ErrorPanel } from "@/components/layout";
import { Button } from "@/components/ui";
import { clearSavedSession } from "@/lib";

type HomeErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function HomeError({ reset }: HomeErrorProps) {
  const startOver = () => {
    clearSavedSession();
    reset();
  };

  return (
    <ErrorPanel
      title="Something went wrong"
      description="The game couldn’t be shown. Try again, or start over to clear the saved game and scores and return to the menu."
    >
      <Button variant="o" size="lg" onClick={reset}>
        Try again
      </Button>
      <Button variant="silver" size="lg" onClick={startOver}>
        Start over
      </Button>
    </ErrorPanel>
  );
}
