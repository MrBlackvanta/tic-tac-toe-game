export type Mark = "x" | "o";
export type Cell = Mark | null;
export type Board = readonly Cell[];
export type Line = readonly [number, number, number];

export type RoundResult =
  | { kind: "win"; mark: Mark; line: Line }
  | { kind: "tie" };

export const EMPTY_BOARD: Board = Array<Cell>(9).fill(null);

const LINES: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function isMark(value: unknown): value is Mark {
  return value === "x" || value === "o";
}

export function opponentOf(mark: Mark): Mark {
  return mark === "x" ? "o" : "x";
}

export function countMarks(board: Board, mark: Mark) {
  return board.filter((cell) => cell === mark).length;
}

export function openCells(board: Board) {
  return board.flatMap((cell, index) => (cell === null ? [index] : []));
}

export function cellName(index: number) {
  return `row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}`;
}

export function placedCell(before: Board, after: Board) {
  const index = after.findIndex(
    (cell, position) => cell !== null && before[position] === null,
  );
  return index === -1 ? null : index;
}

export function place(board: Board, index: number, mark: Mark): Board {
  return board.with(index, mark);
}

export function markToPlay(board: Board, starter: Mark): Mark {
  return countMarks(board, starter) > countMarks(board, opponentOf(starter))
    ? opponentOf(starter)
    : starter;
}

export function roundResult(board: Board): RoundResult | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && board[b] === mark && board[c] === mark) {
      return { kind: "win", mark, line };
    }
  }
  return board.includes(null) ? null : { kind: "tie" };
}
