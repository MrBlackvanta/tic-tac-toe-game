import { MarkIcon } from "@/components/icons";
import {
  cellName,
  type Board as BoardCells,
  type Line,
  type Mark,
} from "@/lib";

type BoardProps = {
  board: BoardCells;
  turn: Mark;
  playable: boolean;
  winningLine: Line | null;
  autoFocus: boolean;
  onPlay: (cell: number) => void;
};

const WIN_STYLES = {
  x: "bg-x inset-shadow-x-dark text-surface",
  o: "bg-o inset-shadow-o-dark text-surface",
};

const MARK_COLOURS = { x: "text-x", o: "text-o" };

function focusFirstCell(board: HTMLFieldSetElement | null) {
  board?.querySelector("button")?.focus();
}

function cellLabel(index: number, mark: Mark | null) {
  const name = cellName(index);
  return `${name[0].toUpperCase()}${name.slice(1)}, ${mark?.toUpperCase() ?? "empty"}`;
}

export default function Board({
  board,
  turn,
  playable,
  winningLine,
  autoFocus,
  onPlay,
}: BoardProps) {
  return (
    <fieldset ref={autoFocus ? focusFirstCell : undefined}>
      <legend className="sr-only">Board</legend>
      <div className="grid grid-cols-3 gap-5">
        {board.map((mark, index) => {
          const open = playable && mark === null;
          const won = mark !== null && winningLine?.includes(index);
          const style = won
            ? WIN_STYLES[mark]
            : `bg-surface inset-shadow-surface-dark ${mark ? MARK_COLOURS[mark] : "text-muted"}`;

          return (
            <button
              key={index}
              type="button"
              aria-label={cellLabel(index, mark)}
              aria-disabled={!open}
              onClick={open ? () => onPlay(index) : undefined}
              className={`group/cell grid aspect-square place-items-center rounded-md pb-2 inset-shadow-lg aria-disabled:cursor-default md:rounded-lg md:pb-0 ${style}`}
            >
              {mark ? (
                <MarkIcon
                  mark={mark}
                  className="size-10 motion-safe:transition-[opacity,scale] md:size-16 motion-safe:starting:scale-75 motion-safe:starting:opacity-0"
                />
              ) : (
                open && (
                  <MarkIcon
                    mark={turn}
                    outline
                    className={`size-10 opacity-0 group-hover/cell:opacity-100 md:size-16 ${MARK_COLOURS[turn]}`}
                  />
                )
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
