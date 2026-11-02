import { Button, Dialog } from "@/components/ui";
import { useEffect, useId, useRef } from "react";

type RestartDialogProps = {
  onCancel: () => void;
  onRestart: () => void;
};

export default function RestartDialog({
  onCancel,
  onRestart,
}: RestartDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => dialogRef.current?.showModal(), []);

  function restart() {
    if (!dialogRef.current?.open) return;

    dialogRef.current.close();
    onRestart();
  }

  return (
    <Dialog ref={dialogRef} aria-labelledby={id} onClose={onCancel}>
      <h2 id={id} className="text-heading-m uppercase md:text-heading-l">
        Restart game?
      </h2>
      <div className="mt-6 flex flex-wrap justify-center gap-4 md:mt-8">
        <Button
          variant="silver"
          size="sm"
          onClick={() => dialogRef.current?.close()}
        >
          No, cancel
        </Button>
        <Button variant="o" size="sm" onClick={restart}>
          Yes, restart
        </Button>
      </div>
    </Dialog>
  );
}
