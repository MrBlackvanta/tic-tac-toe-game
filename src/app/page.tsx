import { SITE_NAME } from "@/data";
import { TicTacToe } from "@/views/home";

export default function Home() {
  return (
    <main className="flex grow flex-col p-6 in-data-resuming:invisible">
      <h1 className="sr-only">{SITE_NAME}</h1>
      <TicTacToe />
    </main>
  );
}
