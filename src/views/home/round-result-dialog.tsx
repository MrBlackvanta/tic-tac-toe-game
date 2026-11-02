import { MarkIcon } from "@/components/icons";
import { Button, Dialog } from "@/components/ui";
import { winnerMessage, type Game, type RoundResult } from "@/lib";
import { useEffect, useId, useRef } from "react";

type RoundResultDialogProps = {
  game: Game;
  result: RoundResult;
  onQuit: () => void;
  onNextRound: () => void;
};

const MARK_TEXT = { x: "text-x", o: "text-o" };

export default function RoundResultDialog({
  game,
  result,
  onQuit,
  onNextRound,
}: RoundResultDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextRoundRef = useRef<HTMLButtonElement>(null);
  const answered = useRef(false);
  const id = useId();

  function open() {
    dialogRef.current?.showModal();
    nextRoundRef.current?.focus();
  }

  useEffect(open, []);

  function reopenUnlessAnswered() {
    if (!answered.current) open();
  }

  function answer(action: () => void) {
    if (!dialogRef.current?.open) return;

    answered.current = true;
    dialogRef.current.close();
    action();
  }

  return (
    <Dialog
      ref={dialogRef}
      closedby="none"
      aria-labelledby={
        result.kind === "win" ? `${id}-message ${id}-title` : `${id}-title`
      }
      onCancel={(event) => event.preventDefault()}
      onClose={reopenUnlessAnswered}
    >
      {result.kind === "win" ? (
        <>
          <p
            id={`${id}-message`}
            className="font-bold uppercase md:text-heading-xs"
          >
            {winnerMessage(game, result.mark)}
          </p>
          <h2
            id={`${id}-title`}
            className={`mt-4 flex items-center justify-center gap-2 text-heading-m uppercase md:gap-6 md:text-heading-l ${MARK_TEXT[result.mark]}`}
          >
            <MarkIcon mark={result.mark} className="size-7.5 md:size-16" />
            <span className="sr-only">{result.mark.toUpperCase()}</span> Takes
            the round
          </h2>
        </>
      ) : (
        <h2
          id={`${id}-title`}
          className="text-heading-m uppercase md:text-heading-l"
        >
          Round tied
        </h2>
      )}
      <div
        className={`mt-6 flex flex-wrap justify-center gap-4 ${result.kind === "tie" ? "md:mt-8" : ""}`}
      >
        <Button variant="silver" size="sm" onClick={() => answer(onQuit)}>
          Quit
        </Button>
        <Button
          ref={nextRoundRef}
          variant="o"
          size="sm"
          onClick={() => answer(onNextRound)}
        >
          Next round
        </Button>
      </div>
    </Dialog>
  );
}
