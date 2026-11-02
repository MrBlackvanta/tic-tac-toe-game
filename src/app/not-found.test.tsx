import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import NotFound, { metadata } from "./not-found";

describe("NotFound", () => {
  it("names the problem as the only heading of the main landmark", () => {
    render(<NotFound />);

    expect(screen.getByRole("main")).toContainElement(
      screen.getByRole("heading", { level: 1, name: "Page not found" }),
    );
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("offers exactly one way out, a real link back to the game", () => {
    render(<NotFound />);

    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName("Back to the game");
    expect(link).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("carries its own title, drops the home canonical and leaves noindex to Next", () => {
    expect(metadata.title).toBe("Tic Tac Toe | Page not found");
    expect(metadata.alternates).toEqual({ canonical: null });
    expect(metadata).not.toHaveProperty("robots");
  });
});
