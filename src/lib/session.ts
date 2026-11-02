import { countMarks, isMark, opponentOf, type Board, type Mark } from "./board";
import {
  gameReducer,
  isOpponent,
  newGame,
  roundStarter,
  type Game,
  type GameAction,
  type Opponent,
} from "./game";

export type Session =
  | { screen: "menu"; player1: Mark }
  | { screen: "game"; game: Game };

export type SessionAction =
  | { type: "start"; player1: Mark; opponent: Opponent }
  | { type: "quit" }
  | GameAction;

export const FIRST_VISIT: Session = { screen: "menu", player1: "x" };

export function sessionReducer(
  session: Session,
  action: SessionAction,
): Session {
  switch (action.type) {
    case "start":
      return { screen: "game", game: newGame(action.player1, action.opponent) };
    case "quit":
      return session.screen === "game"
        ? { screen: "menu", player1: session.game.player1 }
        : session;
    default: {
      if (session.screen === "menu") return session;

      const game = gameReducer(session.game, action);
      return game === session.game ? session : { screen: "game", game };
    }
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCount = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) >= 0;

const isBoard = (value: unknown): value is Board =>
  Array.isArray(value) &&
  value.length === 9 &&
  value.every((cell) => cell === null || isMark(cell));

function followsTurnOrder(board: Board, round: number) {
  const starter = roundStarter(round);
  const lead =
    countMarks(board, starter) - countMarks(board, opponentOf(starter));
  return lead === 0 || lead === 1;
}

function isGame(value: unknown): value is Game {
  return (
    isRecord(value) &&
    isMark(value.player1) &&
    isOpponent(value.opponent) &&
    isCount(value.round) &&
    value.round > 0 &&
    isBoard(value.board) &&
    followsTurnOrder(value.board, value.round) &&
    isRecord(value.scores) &&
    isCount(value.scores.x) &&
    isCount(value.scores.o) &&
    isCount(value.scores.ties)
  );
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value)) return false;
  if (value.screen === "menu") return isMark(value.player1);
  return value.screen === "game" && isGame(value.game);
}

export function parseSession(json: string | null): Session | null {
  if (json === null) return null;

  try {
    const value: unknown = JSON.parse(json);
    return isSession(value) ? value : null;
  } catch {
    return null;
  }
}
