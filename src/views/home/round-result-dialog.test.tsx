import { newGame, type Mark, type Opponent, type RoundResult } from "@/lib";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import RoundResultDialog from "./round-result-dialog";

const win = (mark: Mark): RoundResult => ({
  kind: "win",
  mark,
  line: [0, 1, 2],
});

function renderResult(
  result: RoundResult,
  player1: Mark = "x",
  opponent: Opponent = "cpu",
) {
  const onQuit = vi.fn();
  const onNextRound = vi.fn();
  render(
    <RoundResultDialog
      game={newGame(player1, opponent)}
      result={result}
      onQuit={onQuit}
      onNextRound={onNextRound}
    />,
  );
  return { onQuit, onNextRound, dialog: screen.getByRole("dialog") };
}

const pressEscape = () =>
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });

describe("RoundResultDialog", () => {
  it.each<[string, Mark, Opponent, Mark, string, string]>([
    [
      "player 1 beating the CPU",
      "x",
      "cpu",
      "x",
      "You won!",
      "X Takes the round",
    ],
    [
      "the CPU beating player 1",
      "x",
      "cpu",
      "o",
      "Oh no, you lost…",
      "O Takes the round",
    ],
    [
      "player 1 winning on O",
      "o",
      "player",
      "o",
      "Player 1 wins!",
      "O Takes the round",
    ],
    [
      "player 2 winning on O",
      "x",
      "player",
      "o",
      "Player 2 wins!",
      "O Takes the round",
    ],
  ])("announces %s", (_, player1, opponent, winner, message, title) => {
    const { dialog } = renderResult(win(winner), player1, opponent);

    expect(dialog).toHaveAccessibleName(new RegExp(`^${message}`));
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(title);
  });

  it("announces a tie without a winner", () => {
    const { dialog } = renderResult({ kind: "tie" });

    expect(dialog).toHaveAccessibleName("Round tied");
    expect(screen.queryByText(/takes the round/i)).not.toBeInTheDocument();
  });

  it("opens modally on Next round", () => {
    const { dialog } = renderResult(win("x"));

    expect(dialog).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Next round" })).toHaveFocus();
  });

  it("cannot be dismissed with Escape", () => {
    const { dialog, onQuit, onNextRound } = renderResult({ kind: "tie" });
    const closed = vi.fn();
    dialog.addEventListener("close", closed);

    pressEscape();

    expect(dialog).toHaveAttribute("open");
    expect(closed).not.toHaveBeenCalled();
    expect(onQuit).not.toHaveBeenCalled();
    expect(onNextRound).not.toHaveBeenCalled();
  });

  it("reopens when the browser forces it closed", () => {
    const { dialog } = renderResult(win("o"));

    (dialog as HTMLDialogElement).close();

    expect(dialog).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Next round" })).toHaveFocus();
  });

  it.each([
    ["Quit", "onQuit"],
    ["Next round", "onNextRound"],
  ] as const)("answers %s once and closes", async (button, handler) => {
    const handlers = renderResult(win("x"));
    const user = userEvent.setup();

    await user.dblClick(screen.getByRole("button", { name: button }));

    expect(handlers[handler]).toHaveBeenCalledOnce();
    expect(handlers.dialog).not.toHaveAttribute("open");
  });
});
