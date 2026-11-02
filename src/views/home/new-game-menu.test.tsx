import type { Mark } from "@/lib";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import NewGameMenu from "./new-game-menu";

function renderMenu({
  player1 = "x",
  focusOnMount = false,
}: { player1?: Mark; focusOnMount?: boolean } = {}) {
  const onStart = vi.fn();
  render(
    <NewGameMenu
      player1={player1}
      focusOnMount={focusOnMount}
      onStart={onStart}
    />,
  );
  return { onStart, user: userEvent.setup() };
}

const markGroup = () =>
  screen.getByRole("group", { name: "Pick player 1’s mark" });

describe("NewGameMenu", () => {
  it("offers player 1's mark as one radio group of X and O", () => {
    renderMenu();
    const [x, o, ...rest] = within(markGroup()).getAllByRole("radio");

    expect(screen.getByRole("form", { name: "New game" })).toContainElement(
      markGroup(),
    );
    expect(x).toHaveAccessibleName("X");
    expect(o).toHaveAccessibleName("O");
    expect(rest).toEqual([]);
  });

  it.each<[Mark, string]>([
    ["x", "X"],
    ["o", "O"],
  ])("checks %s when it was player 1's last pick", (player1, name) => {
    renderMenu({ player1 });

    expect(screen.getByRole("radio", { checked: true })).toHaveAccessibleName(
      name,
    );
  });

  it.each<[string, string, Mark, string]>([
    ["vs CPU", "New game (vs CPU)", "o", "cpu"],
    ["vs player", "New game (vs player)", "x", "player"],
  ])(
    "starts a game %s with the picked mark",
    async (_, button, mark, opponent) => {
      const { onStart, user } = renderMenu({
        player1: mark === "x" ? "o" : "x",
      });

      await user.click(screen.getByRole("radio", { name: mark.toUpperCase() }));
      await user.click(screen.getByRole("button", { name: button }));

      expect(onStart).toHaveBeenCalledExactlyOnceWith(mark, opponent);
    },
  );

  it("starts with the default mark untouched", async () => {
    const { onStart, user } = renderMenu();

    await user.click(screen.getByRole("button", { name: "New game (vs CPU)" }));

    expect(onStart).toHaveBeenCalledExactlyOnceWith("x", "cpu");
  });

  it("puts focus on the picked mark when returning from a game", () => {
    renderMenu({ player1: "o", focusOnMount: true });

    expect(screen.getByRole("radio", { name: "O" })).toHaveFocus();
  });

  it("leaves focus alone on a first visit", () => {
    renderMenu();

    expect(document.body).toHaveFocus();
  });
});
