import { boardFrom } from "@/test/board";
import { describe, expect, it } from "vite-plus/test";
import type { Mark } from "./board";
import {
  currentTurn,
  describeMove,
  gameReducer,
  isCpuTurn,
  newGame,
  roundStarter,
  sideName,
  winnerMessage,
  type Game,
  type GameAction,
  type Opponent,
} from "./game";

const plays = (...cells: number[]): GameAction[] =>
  cells.map((cell) => ({ type: "play", cell }));

function play(
  actions: GameAction[],
  player1: Mark = "x",
  opponent: Opponent = "player",
) {
  return actions.reduce(gameReducer, newGame(player1, opponent));
}

const X_WINS_TOP_ROW = plays(0, 3, 1, 4, 2);
const TIE = plays(0, 1, 2, 4, 3, 5, 7, 6, 8);

describe("newGame", () => {
  it("starts round 1 on an empty board with no scores", () => {
    expect(newGame("o", "cpu")).toEqual({
      player1: "o",
      opponent: "cpu",
      round: 1,
      board: boardFrom("---------"),
      scores: { x: 0, o: 0, ties: 0 },
    });
  });
});

describe("roundStarter", () => {
  it.each<[number, Mark]>([
    [1, "x"],
    [2, "o"],
    [3, "x"],
    [4, "o"],
  ])("lets round %i open with %s", (round, mark) => {
    expect(roundStarter(round)).toBe(mark);
  });
});

describe("gameReducer", () => {
  it("alternates marks from X in round 1", () => {
    const game = play(plays(4, 0, 8));

    expect(game.board).toEqual(boardFrom("o-- -x- --x"));
    expect(currentTurn(game)).toBe("o");
  });

  it.each<[string, GameAction[]]>([
    ["a taken cell", plays(4, 4)],
    ["a cell off the board", plays(9)],
    ["a move after the round is won", [...X_WINS_TOP_ROW, ...plays(8)]],
    ["a move after a tie", [...TIE, ...plays(0)]],
  ])("ignores %s", (_, actions) => {
    const before = play(actions.slice(0, -1));

    expect(gameReducer(before, actions.at(-1)!)).toBe(before);
  });

  it("scores a win once, for the winning mark", () => {
    expect(play(X_WINS_TOP_ROW).scores).toEqual({ x: 1, o: 0, ties: 0 });
  });

  it("scores a tie once", () => {
    expect(play(TIE).scores).toEqual({ x: 0, o: 0, ties: 1 });
  });

  it("lets O open the next round and keeps the scores", () => {
    const game = play([...X_WINS_TOP_ROW, { type: "next-round" }]);

    expect(game).toMatchObject({
      round: 2,
      board: boardFrom("---------"),
      scores: { x: 1, o: 0, ties: 0 },
    });
    expect(currentTurn(game)).toBe("o");
  });

  it("ignores next round while the round is still in play", () => {
    const before = play(plays(0));

    expect(gameReducer(before, { type: "next-round" })).toBe(before);
  });

  it("restarts at round 1 with no scores and the same setup", () => {
    const game = play(
      [
        ...X_WINS_TOP_ROW,
        { type: "next-round" },
        ...plays(4),
        { type: "restart" },
      ],
      "o",
    );

    expect(game).toEqual(newGame("o", "player"));
  });
});

describe("against the CPU", () => {
  const cpuPlay = (roll = 0): GameAction => ({ type: "cpu-play", roll });
  const WON_BY_PLAYER_1: Game = {
    ...newGame("x", "cpu"),
    board: boardFrom("xxx oo- ---"),
    scores: { x: 1, o: 0, ties: 0 },
  };

  it("gives the CPU the first move when player 1 picks O", () => {
    const game = newGame("o", "cpu");

    expect(isCpuTurn(game)).toBe(true);
    expect(gameReducer(game, { type: "play", cell: 0 })).toBe(game);
    expect(gameReducer(game, cpuPlay()).board).toEqual(boardFrom("---- x----"));
  });

  it("waits for player 1 when they pick X", () => {
    const game = newGame("x", "cpu");

    expect(isCpuTurn(game)).toBe(false);
    expect(gameReducer(game, cpuPlay())).toBe(game);
  });

  it("hands the turn to the CPU after player 1 moves", () => {
    const game = play([...plays(0), cpuPlay()], "x", "cpu");

    expect(game.board).toEqual(boardFrom("x-- -o- ---"));
    expect(isCpuTurn(game)).toBe(false);
  });

  it("blocks player 1's line", () => {
    const game = play(
      [...plays(0), cpuPlay(), ...plays(1), cpuPlay()],
      "x",
      "cpu",
    );

    expect(game.board).toEqual(boardFrom("xxo -o- ---"));
  });

  it("never plays in a finished round", () => {
    expect(isCpuTurn(WON_BY_PLAYER_1)).toBe(false);
  });

  it("opens round 2 when player 1 is X", () => {
    const game = gameReducer(WON_BY_PLAYER_1, { type: "next-round" });

    expect(isCpuTurn(game)).toBe(true);
  });

  it("never plays in a two-player game", () => {
    expect(isCpuTurn(play(plays(0)))).toBe(false);
  });
});

describe("naming", () => {
  it.each<[Mark, Opponent, Mark, string, string]>([
    ["x", "cpu", "x", "You", "You won!"],
    ["x", "cpu", "o", "CPU", "Oh no, you lost…"],
    ["o", "cpu", "x", "CPU", "Oh no, you lost…"],
    ["o", "cpu", "o", "You", "You won!"],
    ["x", "player", "x", "P1", "Player 1 wins!"],
    ["x", "player", "o", "P2", "Player 2 wins!"],
    ["o", "player", "x", "P2", "Player 2 wins!"],
    ["o", "player", "o", "P1", "Player 1 wins!"],
  ])(
    "player 1 on %s against %s calls %s %s",
    (player1, opponent, mark, side, message) => {
      const game = newGame(player1, opponent);

      expect(sideName(game, mark)).toBe(side);
      expect(winnerMessage(game, mark)).toBe(message);
    },
  );
});

describe("describeMove", () => {
  it.each<[Mark, Opponent, number[], number, string]>([
    ["x", "cpu", [0], 0, "You played X in row 1, column 1."],
    ["x", "player", [0, 4], 4, "P2 played O in row 2, column 2."],
    ["x", "player", [0], 8, ""],
  ])("player 1 on %s against %s", (player1, opponent, cells, cell, text) => {
    expect(describeMove(play(plays(...cells), player1, opponent), cell)).toBe(
      text,
    );
  });
});
