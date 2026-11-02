import { boardFrom } from "@/test/board";
import { describe, expect, it } from "vite-plus/test";
import {
  cellName,
  EMPTY_BOARD,
  markToPlay,
  openCells,
  place,
  placedCell,
  roundResult,
  type Line,
  type Mark,
} from "./board";

const LINES: [string, Line][] = [
  ["top row", [0, 1, 2]],
  ["middle row", [3, 4, 5]],
  ["bottom row", [6, 7, 8]],
  ["left column", [0, 3, 6]],
  ["middle column", [1, 4, 7]],
  ["right column", [2, 5, 8]],
  ["falling diagonal", [0, 4, 8]],
  ["rising diagonal", [2, 4, 6]],
];

describe("roundResult", () => {
  it.each(
    LINES.flatMap(([name, line]) =>
      (["x", "o"] as const).map((mark): [Mark, string, Line] => [
        mark,
        name,
        line,
      ]),
    ),
  )("gives %s the win on the %s", (mark, _, line) => {
    const board = line.reduce(
      (current, index) => place(current, index, mark),
      EMPTY_BOARD,
    );

    expect(roundResult(board)).toEqual({ kind: "win", mark, line });
  });

  it("calls a full board with no line a tie", () => {
    expect(roundResult(boardFrom("xox xoo oxx"))).toEqual({ kind: "tie" });
  });

  it("prefers the line over the tie when the last mark completes one", () => {
    expect(roundResult(boardFrom("xox oxo oxx"))).toMatchObject({
      kind: "win",
      mark: "x",
    });
  });

  it.each(["---------", "xo- --- ---", "xox xoo ox-"])(
    "leaves %s in play",
    (rows) => {
      expect(roundResult(boardFrom(rows))).toBeNull();
    },
  );
});

describe("markToPlay", () => {
  it.each<[string, Mark, Mark]>([
    ["---------", "x", "x"],
    ["---------", "o", "o"],
    ["x--------", "x", "o"],
    ["o--------", "o", "x"],
    ["xo-------", "x", "x"],
    ["ox-------", "o", "o"],
  ])("on %s started by %s, %s plays next", (rows, starter, next) => {
    expect(markToPlay(boardFrom(rows), starter)).toBe(next);
  });
});

describe("openCells", () => {
  it("lists the empty cells in board order", () => {
    expect(openCells(boardFrom("x-o -x- o--"))).toEqual([1, 3, 5, 7, 8]);
  });
});

describe("place", () => {
  it("returns a new board and leaves the old one alone", () => {
    const before = boardFrom("---------");

    expect(place(before, 4, "o")).toEqual(boardFrom("---- o----"));
    expect(before).toEqual(EMPTY_BOARD);
  });
});

describe("cellName", () => {
  it.each<[number, string]>([
    [0, "row 1, column 1"],
    [5, "row 2, column 3"],
    [7, "row 3, column 2"],
  ])("names cell %i %s", (index, name) => {
    expect(cellName(index)).toBe(name);
  });
});

describe("placedCell", () => {
  it.each<[string, string, string, number | null]>([
    ["finds the new mark", "x-- --- ---", "x-- -o- ---", 4],
    ["finds nothing on an unchanged board", "x-- --- ---", "x-- --- ---", null],
    ["finds nothing on a cleared board", "xo- --- ---", "--- --- ---", null],
  ])("%s", (_, before, after, cell) => {
    expect(placedCell(boardFrom(before), boardFrom(after))).toBe(cell);
  });
});
