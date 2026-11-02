import { newGame, type Mark, type Opponent } from "@/lib";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import Scoreboard from "./scoreboard";

describe("Scoreboard", () => {
  it.each<[Mark, Opponent, string[]]>([
    ["x", "cpu", ["X (You)", "Ties", "O (CPU)"]],
    ["o", "cpu", ["X (CPU)", "Ties", "O (You)"]],
    ["x", "player", ["X (P1)", "Ties", "O (P2)"]],
    ["o", "player", ["X (P2)", "Ties", "O (P1)"]],
  ])(
    "labels player 1 on %s against %s as X, ties, O",
    (player1, opponent, terms) => {
      render(<Scoreboard game={newGame(player1, opponent)} />);

      expect(
        screen.getAllByRole("term").map((term) => term.textContent),
      ).toEqual(terms);
    },
  );

  it("pairs each label with its score", () => {
    const game = { ...newGame("x", "cpu"), scores: { x: 14, o: 11, ties: 32 } };
    render(<Scoreboard game={game} />);

    expect(
      screen.getAllByRole("definition").map((score) => score.textContent),
    ).toEqual(["14", "32", "11"]);
  });
});
