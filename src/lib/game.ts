import {
  cellName,
  EMPTY_BOARD,
  markToPlay,
  opponentOf,
  place,
  roundResult,
  type Board,
  type Mark,
} from "./board";
import { chooseCpuCell } from "./cpu";

export const CPU_DELAY = 500;

export type Opponent = "cpu" | "player";

export type Scores = Record<Mark | "ties", number>;

export type Game = {
  player1: Mark;
  opponent: Opponent;
  round: number;
  board: Board;
  scores: Scores;
};

export type GameAction =
  | { type: "play"; cell: number }
  | { type: "cpu-play"; roll: number }
  | { type: "next-round" }
  | { type: "restart" };

const NO_SCORES: Scores = { x: 0, o: 0, ties: 0 };

export function newGame(player1: Mark, opponent: Opponent): Game {
  return {
    player1,
    opponent,
    round: 1,
    board: EMPTY_BOARD,
    scores: NO_SCORES,
  };
}

export function isOpponent(value: unknown): value is Opponent {
  return value === "cpu" || value === "player";
}

export function roundStarter(round: number): Mark {
  return round % 2 === 1 ? "x" : "o";
}

export function currentTurn(game: Game) {
  return markToPlay(game.board, roundStarter(game.round));
}

export function isCpuTurn(game: Game) {
  return (
    game.opponent === "cpu" &&
    roundResult(game.board) === null &&
    currentTurn(game) === opponentOf(game.player1)
  );
}

export function sideName(game: Game, mark: Mark) {
  const isPlayer1 = mark === game.player1;
  if (game.opponent === "cpu") return isPlayer1 ? "You" : "CPU";
  return isPlayer1 ? "P1" : "P2";
}

export function winnerMessage(game: Game, mark: Mark) {
  const isPlayer1 = mark === game.player1;
  if (game.opponent === "cpu") {
    return isPlayer1 ? "You won!" : "Oh no, you lost…";
  }
  return isPlayer1 ? "Player 1 wins!" : "Player 2 wins!";
}

export function describeMove(game: Game, cell: number) {
  const mark = game.board[cell];
  if (!mark) return "";

  return `${sideName(game, mark)} played ${mark.toUpperCase()} in ${cellName(cell)}.`;
}

function placeMark(game: Game, cell: number): Game {
  if (game.board[cell] !== null || roundResult(game.board)) return game;

  const board = place(game.board, cell, currentTurn(game));
  const result = roundResult(board);
  if (!result) return { ...game, board };

  const winner = result.kind === "win" ? result.mark : "ties";
  return {
    ...game,
    board,
    scores: { ...game.scores, [winner]: game.scores[winner] + 1 },
  };
}

export function gameReducer(game: Game, action: GameAction): Game {
  switch (action.type) {
    case "play":
      return isCpuTurn(game) ? game : placeMark(game, action.cell);
    case "cpu-play":
      return isCpuTurn(game)
        ? placeMark(
            game,
            chooseCpuCell(game.board, currentTurn(game), action.roll),
          )
        : game;
    case "next-round":
      return roundResult(game.board)
        ? { ...game, round: game.round + 1, board: EMPTY_BOARD }
        : game;
    case "restart":
      return newGame(game.player1, game.opponent);
  }
}
