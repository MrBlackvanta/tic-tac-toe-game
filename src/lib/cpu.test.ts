import { boardFrom } from "@/test/board";
import { describe, expect, it } from "vite-plus/test";
import type { Mark } from "./board";
import { chooseCpuCell } from "./cpu";

const ROLLS = [0, 0.25, 0.5, 0.75, 0.999];

function choices(rows: string, mark: Mark) {
  const cells = ROLLS.map((roll) => chooseCpuCell(boardFrom(rows), mark, roll));
  return [...new Set(cells)].sort((a, b) => a - b);
}

describe("chooseCpuCell", () => {
  it.each<[string, string, Mark, number[]]>([
    ["completes its own line", "oo- xx- x--", "o", [2]],
    ["takes the win over a block", "xx- oo- ---", "o", [5]],
    ["blocks the only threat", "xx- -o- ---", "o", [2]],
    ["blocks either of two threats", "xx- --- x-o", "o", [2, 3]],
    ["takes the centre when nothing is at stake", "x-- --- ---", "o", [4]],
    [
      "takes a corner once the centre is gone",
      "--- -x- ---",
      "o",
      [0, 2, 6, 8],
    ],
    ["falls back to a side", "xox -o- oxo", "x", [3, 5]],
  ])("%s", (_, rows, mark, cells) => {
    expect(choices(rows, mark)).toEqual(cells);
  });

  it("plays the opening move into the centre", () => {
    expect(choices("---------", "x")).toEqual([4]);
  });

  it("picks between equal options by the roll", () => {
    const board = boardFrom("--- -x- ---");

    expect(chooseCpuCell(board, "o", 0)).toBe(0);
    expect(chooseCpuCell(board, "o", 0.999)).toBe(8);
  });

  it.each(["xo- --- ---", "x-- -o- --x", "oxo xo- x--", "xox oxo ox-"])(
    "only ever chooses an open cell on %s",
    (rows) => {
      const board = boardFrom(rows);

      for (const cell of choices(rows, "o")) expect(board[cell]).toBeNull();
    },
  );
});
