import { Logo, MarkIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import { isMark, isOpponent, type Mark, type Opponent } from "@/lib";
import type { SubmitEvent } from "react";

type NewGameMenuProps = {
  player1: Mark;
  focusOnMount: boolean;
  onStart: (player1: Mark, opponent: Opponent) => void;
};

const MARKS: readonly Mark[] = ["x", "o"];

function focusCheckedMark(form: HTMLFormElement | null) {
  form?.querySelector<HTMLInputElement>(":checked")?.focus();
}

export default function NewGameMenu({
  player1,
  focusOnMount,
  onStart,
}: NewGameMenuProps) {
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget, event.nativeEvent.submitter);
    const mark = data.get("player1");
    const opponent = data.get("opponent");
    if (isMark(mark) && isOpponent(opponent)) onStart(mark, opponent);
  }

  return (
    <form
      ref={focusOnMount ? focusCheckedMark : undefined}
      aria-label="New game"
      onSubmit={handleSubmit}
      className="m-auto w-full max-w-82 md:max-w-115"
    >
      <Logo className="mx-auto" />
      <div className="mt-8 rounded-lg bg-surface px-6 pt-6 pb-7.5 text-center inset-shadow-lg inset-shadow-surface-dark md:mt-10">
        <fieldset>
          <legend className="mx-auto text-heading-xs uppercase">
            Pick player 1’s mark
          </legend>
          <div className="mt-6 grid h-18 grid-cols-2 items-center rounded-md bg-page px-2">
            {MARKS.map((mark) => (
              <label
                key={mark}
                className="relative grid h-13.5 cursor-pointer place-items-center rounded-md hover:not-has-checked:bg-muted/5 has-checked:bg-muted has-checked:text-page has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-muted motion-safe:transition-[color,background-color]"
              >
                <input
                  type="radio"
                  name="player1"
                  value={mark}
                  defaultChecked={mark === player1}
                  className="sr-only"
                />
                <MarkIcon mark={mark} className="size-8" />
                <span className="sr-only">{mark.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="mt-4.25 uppercase">Remember: X goes first</p>
      </div>
      <div className="mt-8 grid gap-4 md:mt-10 md:gap-5">
        <Button type="submit" name="opponent" value="cpu" variant="o" size="lg">
          New game (vs CPU)
        </Button>
        <Button
          type="submit"
          name="opponent"
          value="player"
          variant="x"
          size="lg"
        >
          New game (vs player)
        </Button>
      </div>
    </form>
  );
}
