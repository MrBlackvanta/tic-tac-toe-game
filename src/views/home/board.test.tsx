import type { Line } from "@/lib";
import { boardFrom } from "@/test/board";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import Board from "./board";

function renderBoard({
  rows = "x-- -o- ---",
  playable = true,
  winningLine = null,
  autoFocus = false,
}: {
  rows?: string;
  playable?: boolean;
  winningLine?: Line | null;
  autoFocus?: boolean;
} = {}) {
  const onPlay = vi.fn();
  render(
    <Board
      board={boardFrom(rows)}
      turn="x"
      playable={playable}
      winningLine={winningLine}
      autoFocus={autoFocus}
      onPlay={onPlay}
    />,
  );
  return { onPlay, user: userEvent.setup() };
}

const cells = () =>
  within(screen.getByRole("group", { name: "Board" })).getAllByRole("button");

describe("Board", () => {
  it("names all nine cells by row, column and contents", () => {
    renderBoard();

    expect(cells().map((cell) => cell.getAttribute("aria-label"))).toEqual([
      "Row 1, column 1, X",
      "Row 1, column 2, empty",
      "Row 1, column 3, empty",
      "Row 2, column 1, empty",
      "Row 2, column 2, O",
      "Row 2, column 3, empty",
      "Row 3, column 1, empty",
      "Row 3, column 2, empty",
      "Row 3, column 3, empty",
    ]);
  });

  it("plays an empty cell", async () => {
    const { onPlay, user } = renderBoard();

    await user.click(
      screen.getByRole("button", { name: "Row 3, column 3, empty" }),
    );

    expect(onPlay).toHaveBeenCalledExactlyOnceWith(8);
  });

  it("refuses a taken cell but keeps it focusable", async () => {
    const { onPlay, user } = renderBoard();
    const taken = screen.getByRole("button", { name: "Row 1, column 1, X" });

    await user.click(taken);

    expect(onPlay).not.toHaveBeenCalled();
    expect(taken).toHaveAttribute("aria-disabled", "true");
    expect(taken).toHaveFocus();
  });

  it("refuses every cell while play is paused", async () => {
    const { onPlay, user } = renderBoard({ playable: false });

    for (const cell of cells()) await user.click(cell);

    expect(onPlay).not.toHaveBeenCalled();
    expect(
      cells().every((cell) => cell.getAttribute("aria-disabled") === "true"),
    ).toBe(true);
  });

  it("marks only the open cells as playable", () => {
    renderBoard();

    expect(
      cells().filter((cell) => cell.getAttribute("aria-disabled") === "false"),
    ).toHaveLength(7);
  });

  it("puts focus on the first cell when a game starts", () => {
    renderBoard({ autoFocus: true });

    expect(cells()[0]).toHaveFocus();
  });

  it("leaves focus alone on a resumed game", () => {
    renderBoard();

    expect(document.body).toHaveFocus();
  });
});
