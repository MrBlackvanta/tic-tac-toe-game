import { Logo, MarkIcon, RestartIcon } from "@/components/icons";
import type { Mark } from "@/lib";

type GameHeaderProps = {
  turn: Mark;
  onRestart: () => void;
};

export default function GameHeader({ turn, onRestart }: GameHeaderProps) {
  return (
    <div className="grid h-10 grid-cols-3 items-center gap-5 md:h-13">
      <Logo />
      <p className="flex h-full items-center justify-center gap-2.25 rounded-sm bg-surface pb-1 font-bold uppercase inset-shadow-sm inset-shadow-surface-dark md:gap-3.25 md:rounded-md md:text-heading-xs">
        <MarkIcon mark={turn} className="size-4 md:size-5" />
        <span className="sr-only">{turn.toUpperCase()}</span> Turn
      </p>
      <button
        type="button"
        aria-label="Restart game"
        onClick={onRestart}
        className="grid size-10 place-items-center justify-self-end rounded-sm bg-muted text-surface inset-shadow-sm inset-shadow-muted-dark hover:bg-muted-light motion-safe:transition-[background-color] md:size-13 md:rounded-md"
      >
        <RestartIcon className="size-4 md:size-5" />
      </button>
    </div>
  );
}
