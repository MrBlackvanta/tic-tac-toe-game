import type { Mark } from "@/lib";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import GameHeader from "./game-header";

describe("GameHeader", () => {
  it.each<[Mark, string]>([
    ["x", "X Turn"],
    ["o", "O Turn"],
  ])("names %s as the mark to play", (turn, text) => {
    render(<GameHeader turn={turn} onRestart={vi.fn()} />);

    expect(screen.getByText("Turn")).toHaveTextContent(text);
  });

  it("asks to restart from a named button", async () => {
    const onRestart = vi.fn();
    render(<GameHeader turn="x" onRestart={onRestart} />);

    await userEvent.click(screen.getByRole("button", { name: "Restart game" }));

    expect(onRestart).toHaveBeenCalledOnce();
  });
});
