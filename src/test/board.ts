import type { Board } from "@/lib";

export function boardFrom(rows: string): Board {
  return rows
    .replace(/\s/g, "")
    .split("")
    .map((cell) => (cell === "x" || cell === "o" ? cell : null));
}
