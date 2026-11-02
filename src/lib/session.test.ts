import { boardFrom } from "@/test/board";
import { describe, expect, it } from "vite-plus/test";
import { newGame } from "./game";
import {
  FIRST_VISIT,
  parseSession,
  sessionReducer,
  type Session,
} from "./session";

const IN_GAME: Session = { screen: "game", game: newGame("o", "cpu") };

describe("sessionReducer", () => {
  it("starts a game from the menu", () => {
    expect(
      sessionReducer(FIRST_VISIT, {
        type: "start",
        player1: "o",
        opponent: "cpu",
      }),
    ).toEqual(IN_GAME);
  });

  it("quits to the menu with player 1's mark still picked", () => {
    expect(sessionReducer(IN_GAME, { type: "quit" })).toEqual({
      screen: "menu",
      player1: "o",
    });
  });

  it("passes moves to the game", () => {
    const session = sessionReducer(IN_GAME, { type: "cpu-play", roll: 0 });

    expect(session).toMatchObject({ game: { board: boardFrom("---- x----") } });
  });

  it.each<[string, Session, Parameters<typeof sessionReducer>[1]]>([
    ["a move on the menu", FIRST_VISIT, { type: "play", cell: 0 }],
    ["quitting the menu", FIRST_VISIT, { type: "quit" }],
    ["a move the game refuses", IN_GAME, { type: "play", cell: 0 }],
  ])("keeps the same session for %s", (_, session, action) => {
    expect(sessionReducer(session, action)).toBe(session);
  });
});

describe("parseSession", () => {
  const json = (value: unknown) => JSON.stringify(value);
  const withGame = (changes: Record<string, unknown>) =>
    json({ screen: "game", game: { ...IN_GAME.game, ...changes } });

  it.each<[string, Session]>([
    ["the menu", FIRST_VISIT],
    ["a fresh game", IN_GAME],
    [
      "a game mid-round",
      {
        screen: "game",
        game: {
          ...newGame("x", "player"),
          round: 2,
          board: boardFrom("ox- o-- ---"),
          scores: { x: 1, o: 0, ties: 0 },
        },
      },
    ],
  ])("restores %s", (_, session) => {
    expect(parseSession(json(session))).toEqual(session);
  });

  it.each<[string, string | null]>([
    ["nothing saved", null],
    ["broken JSON", "{"],
    ["an unknown screen", json({ screen: "scores" })],
    ["a menu without a mark", json({ screen: "menu", player1: "y" })],
    ["an unknown opponent", withGame({ opponent: "bot" })],
    ["a missing player 1", withGame({ player1: undefined })],
    ["a short board", withGame({ board: Array(8).fill(null) })],
    ["a foreign mark", withGame({ board: ["z", ...Array(8).fill(null)] })],
    ["round 0", withGame({ round: 0 })],
    ["a fractional round", withGame({ round: 1.5 })],
    ["a negative score", withGame({ scores: { x: -1, o: 0, ties: 0 } })],
    ["a missing score", withGame({ scores: { x: 0, o: 0 } })],
    ["two moves in a row", withGame({ board: boardFrom("xx- --- ---") })],
    [
      "the wrong opener for the round",
      withGame({ round: 2, board: boardFrom("x-- --- ---") }),
    ],
  ])("rejects %s", (_, saved) => {
    expect(parseSession(saved)).toBeNull();
  });
});
