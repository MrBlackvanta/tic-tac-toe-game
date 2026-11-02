import { CPU_DELAY, createSessionStore, type Mark, type Opponent } from "@/lib";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import TicTacToe from "./tic-tac-toe";

function renderSavedGame(player1: Mark, opponent: Opponent) {
  createSessionStore().dispatch({ type: "start", player1, opponent });
  render(<TicTacToe />);
}

const cell = (name: string) =>
  screen.getByRole("button", { name: new RegExp(`^${name},`) });

const waitForCpu = () => act(() => vi.advanceTimersByTime(CPU_DELAY));

describe("GameScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });
  afterEach(() => vi.useRealTimers());

  it("lets the CPU open when player 1 picks O", async () => {
    renderSavedGame("o", "cpu");

    expect(cell("Row 2, column 2")).toHaveAccessibleName(
      "Row 2, column 2, empty",
    );
    await waitForCpu();

    expect(cell("Row 2, column 2")).toHaveAccessibleName("Row 2, column 2, X");
    expect(screen.getByText("Turn")).toHaveTextContent("O Turn");
  });

  it("answers player 1 after a pause and announces where", async () => {
    renderSavedGame("x", "cpu");

    fireEvent.click(cell("Row 1, column 1"));
    expect(screen.getByRole("status")).toHaveTextContent(
      "You played X in row 1, column 1.",
    );
    await act(() => vi.advanceTimersByTime(CPU_DELAY - 1));
    expect(cell("Row 2, column 2")).toHaveAccessibleName(
      "Row 2, column 2, empty",
    );

    await act(() => vi.advanceTimersByTime(1));

    expect(cell("Row 2, column 2")).toHaveAccessibleName("Row 2, column 2, O");
    expect(screen.getByRole("status")).toHaveTextContent(
      "CPU played O in row 2, column 2.",
    );
  });

  it("ignores clicks while the CPU is thinking", async () => {
    renderSavedGame("x", "cpu");

    fireEvent.click(cell("Row 1, column 1"));
    expect(cell("Row 3, column 3")).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(cell("Row 3, column 3"));
    await waitForCpu();

    expect(cell("Row 3, column 3")).toHaveAccessibleName(
      "Row 3, column 3, empty",
    );
    expect(cell("Row 3, column 3")).toHaveAttribute("aria-disabled", "false");
  });

  it("passes the board between two players without a CPU", async () => {
    renderSavedGame("o", "player");

    fireEvent.click(cell("Row 1, column 1"));
    fireEvent.click(cell("Row 1, column 2"));
    await waitForCpu();

    expect(screen.getByRole("status")).toHaveTextContent(
      "P1 played O in row 1, column 2.",
    );
    expect(screen.getByText("Turn")).toHaveTextContent("X Turn");
    expect(cell("Row 2, column 2")).toHaveAccessibleName(
      "Row 2, column 2, empty",
    );
  });

  it("tallies each side under its own label", () => {
    renderSavedGame("o", "cpu");

    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual(
      ["X (CPU)", "Ties", "O (You)"],
    );
  });

  it("shows the loss when the CPU completes a line", async () => {
    renderSavedGame("x", "cpu");

    for (const name of [
      "Row 1, column 1",
      "Row 3, column 3",
      "Row 1, column 2",
    ]) {
      fireEvent.click(cell(name));
      await waitForCpu();
    }

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      /^Oh no, you lost…/,
    );
    expect(scores()).toEqual(["0", "0", "1"]);
  });

  it("opens the next round for O after X wins", () => {
    renderSavedGame("x", "player");
    playCells(...X_WINS_TOP_ROW);

    expect(screen.getByRole("dialog")).toHaveAccessibleName(/^Player 1 wins!/);
    fireEvent.click(screen.getByRole("button", { name: "Next round" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Turn")).toHaveTextContent("O Turn");
    expect(scores()).toEqual(["1", "0", "0"]);
    expect(cell("Row 1, column 1")).toHaveAccessibleName(
      "Row 1, column 1, empty",
    );
  });

  it("quits to the menu with player 1's mark picked and focused", () => {
    renderSavedGame("o", "player");
    playCells(...X_WINS_TOP_ROW);

    fireEvent.click(screen.getByRole("button", { name: "Quit" }));

    const picked = screen.getByRole("radio", { name: "O" });
    expect(picked).toBeChecked();
    expect(picked).toHaveFocus();
  });

  it("keeps the game when a restart is cancelled", () => {
    renderSavedGame("x", "player");
    fireEvent.click(cell("Row 1, column 1"));
    const restart = screen.getByRole("button", { name: "Restart game" });
    restart.focus();

    fireEvent.click(restart);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Restart game?");
    fireEvent.click(screen.getByRole("button", { name: "No, cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cell("Row 1, column 1")).toHaveAccessibleName("Row 1, column 1, X");
    expect(restart).toHaveFocus();
  });

  it("restarts the whole game on confirm", () => {
    renderSavedGame("x", "player");
    playCells(...X_WINS_TOP_ROW);
    fireEvent.click(screen.getByRole("button", { name: "Next round" }));
    fireEvent.click(cell("Row 2, column 2"));

    fireEvent.click(screen.getByRole("button", { name: "Restart game" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, restart" }));

    expect(scores()).toEqual(["0", "0", "0"]);
    expect(cell("Row 2, column 2")).toHaveAccessibleName(
      "Row 2, column 2, empty",
    );
    expect(screen.getByText("Turn")).toHaveTextContent("X Turn");
  });
});

const X_WINS_TOP_ROW = [
  "Row 1, column 1",
  "Row 2, column 1",
  "Row 1, column 2",
  "Row 2, column 2",
  "Row 1, column 3",
];

function playCells(...names: string[]) {
  for (const name of names) fireEvent.click(cell(name));
}

const scores = () =>
  screen.getAllByRole("definition").map((score) => score.textContent);
