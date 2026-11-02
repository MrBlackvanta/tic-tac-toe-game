import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import RestartDialog from "./restart-dialog";

function renderRestart() {
  const onCancel = vi.fn();
  const onRestart = vi.fn();
  render(<RestartDialog onCancel={onCancel} onRestart={onRestart} />);
  return {
    onCancel,
    onRestart,
    dialog: screen.getByRole("dialog", { name: "Restart game?" }),
    user: userEvent.setup(),
  };
}

describe("RestartDialog", () => {
  it("opens modally on the safe answer", () => {
    const { dialog } = renderRestart();

    expect(dialog).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "No, cancel" })).toHaveFocus();
  });

  it("cancels from the button", async () => {
    const { onCancel, onRestart, dialog, user } = renderRestart();

    await user.click(screen.getByRole("button", { name: "No, cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onRestart).not.toHaveBeenCalled();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("cancels on Escape", () => {
    const { onCancel, onRestart } = renderRestart();

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onRestart).not.toHaveBeenCalled();
  });

  it("restarts once however fast the confirm is clicked", async () => {
    const { onRestart, user } = renderRestart();

    await user.dblClick(screen.getByRole("button", { name: "Yes, restart" }));

    expect(onRestart).toHaveBeenCalledOnce();
  });
});
