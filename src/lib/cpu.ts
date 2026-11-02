import {
  openCells,
  opponentOf,
  place,
  roundResult,
  type Board,
  type Mark,
} from "./board";

const CENTRE = 4;
const CORNERS = [0, 2, 6, 8];

function winningCells(board: Board, mark: Mark) {
  return openCells(board).filter(
    (index) => roundResult(place(board, index, mark))?.kind === "win",
  );
}

export function chooseCpuCell(board: Board, mark: Mark, roll: number) {
  const open = openCells(board);
  const options =
    [
      winningCells(board, mark),
      winningCells(board, opponentOf(mark)),
      open.filter((index) => index === CENTRE),
      open.filter((index) => CORNERS.includes(index)),
    ].find((cells) => cells.length > 0) ?? open;

  return options[Math.floor(roll * options.length)];
}
