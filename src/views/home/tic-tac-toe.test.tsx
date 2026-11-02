import { CPU_DELAY, STORAGE_KEY, newGame, type Session } from "@/lib";
import { boardFrom } from "@/test/board";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import TicTacToe from "./tic-tac-toe";

function save(session: Session | string) {
  localStorage.setItem(
    STORAGE_KEY,
    typeof session === "string" ? session : JSON.stringify(session),
  );
}

const midRound: Session = {
  screen: "game",
  game: {
    ...newGame("o", "cpu"),
    round: 2,
    board: boardFrom("o-- -x- ---"),
    scores: { x: 3, o: 1, ties: 2 },
  },
};

const cpuToMove: Session = {
  screen: "game",
  game: { ...newGame("o", "cpu"), round: 2, board: boardFrom("o-- --- ---") },
};

const cellNames = () =>
  screen
    .getAllByRole("button", { name: /^Row/ })
    .map((cell) => cell.getAttribute("aria-label"));

describe("TicTacToe", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });
  afterEach(() => vi.useRealTimers());

  it("opens the menu on X for a first visit without taking focus", () => {
    render(<TicTacToe />);

    expect(screen.getByRole("radio", { name: "X" })).toBeChecked();
    expect(document.body).toHaveFocus();
  });

  it("starts a game with focus on the first cell", () => {
    render(<TicTacToe />);

    fireEvent.click(
      screen.getByRole("button", { name: "New game (vs player)" }),
    );

    expect(
      screen.getByRole("button", { name: /^Row 1, column 1/ }),
    ).toHaveFocus();
  });

  it("resumes a saved game where it was left", () => {
    save(midRound);
    render(<TicTacToe />);

    expect(cellNames().slice(0, 5)).toEqual([
      "Row 1, column 1, O",
      "Row 1, column 2, empty",
      "Row 1, column 3, empty",
      "Row 2, column 1, empty",
      "Row 2, column 2, X",
    ]);
    expect(
      screen.getAllByRole("definition").map((score) => score.textContent),
    ).toEqual(["3", "2", "1"]);
    expect(document.body).toHaveFocus();
  });

  it("lets the CPU finish its turn after a refresh", async () => {
    save(cpuToMove);
    render(<TicTacToe />);

    await act(() => vi.advanceTimersByTime(CPU_DELAY));

    expect(
      screen.getByRole("button", { name: /^Row 2, column 2/ }),
    ).toHaveAccessibleName("Row 2, column 2, X");
  });

  it("leaves a resumed game alone when it is player 1's turn", async () => {
    save(midRound);
    render(<TicTacToe />);

    await act(() => vi.advanceTimersByTime(CPU_DELAY * 4));

    expect(cellNames().filter((name) => !name?.endsWith("empty"))).toHaveLength(
      2,
    );
  });

  it("keeps every move across a refresh", () => {
    const { unmount } = render(<TicTacToe />);
    fireEvent.click(
      screen.getByRole("button", { name: "New game (vs player)" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Row 3, column 3/ }));
    const before = cellNames();

    unmount();
    render(<TicTacToe />);

    expect(cellNames()).toEqual(before);
    expect(before).toContain("Row 3, column 3, X");
  });

  it("falls back to the menu when the save is corrupt", () => {
    save('{"screen":"game","game":{"board":"oops"}}');
    render(<TicTacToe />);

    expect(screen.getByRole("form", { name: "New game" })).toBeInTheDocument();
  });

  it("lifts the pre-paint gate only once the saved game replaces the prerendered menu", async () => {
    const container = document.createElement("main");
    container.innerHTML = renderToString(<TicTacToe />);
    document.body.append(container);
    save(midRound);
    const root = document.documentElement;
    root.dataset.resuming = "";
    const removeAttribute = root.removeAttribute.bind(root);
    const boardShownAtLift: boolean[] = [];
    vi.spyOn(root, "removeAttribute").mockImplementation((name) => {
      boardShownAtLift.push(container.querySelector("fieldset") !== null);
      removeAttribute(name);
    });

    await act(async () => {
      hydrateRoot(container, <TicTacToe />);
    });

    expect(root).not.toHaveAttribute("data-resuming");
    expect(boardShownAtLift).toEqual([true]);
    container.remove();
  });
});
