import {
  CPU_DELAY,
  currentTurn,
  describeMove,
  isCpuTurn,
  placedCell,
  roundResult,
  type Game,
  type GameAction,
} from "@/lib";
import { useEffect, useState } from "react";
import Board from "./board";
import GameHeader from "./game-header";
import RestartDialog from "./restart-dialog";
import RoundResultDialog from "./round-result-dialog";
import Scoreboard from "./scoreboard";

type GameScreenProps = {
  game: Game;
  autoFocus: boolean;
  dispatch: (action: GameAction) => void;
  onQuit: () => void;
};

export default function GameScreen({
  game,
  autoFocus,
  dispatch,
  onQuit,
}: GameScreenProps) {
  const [confirmingRestart, setConfirmingRestart] = useState(false);
  const [announced, setAnnounced] = useState({ board: game.board, text: "" });
  const turn = currentTurn(game);
  const result = roundResult(game.board);
  const cpuToMove = isCpuTurn(game);

  if (announced.board !== game.board) {
    const cell = placedCell(announced.board, game.board);
    setAnnounced({
      board: game.board,
      text: cell === null ? "" : describeMove(game, cell),
    });
  }

  useEffect(() => {
    if (!cpuToMove) return;

    const timeout = setTimeout(
      () => dispatch({ type: "cpu-play", roll: Math.random() }),
      CPU_DELAY,
    );
    return () => clearTimeout(timeout);
  }, [cpuToMove, dispatch]);

  return (
    <div className="mx-auto w-full max-w-82 md:my-auto md:max-w-115">
      <GameHeader turn={turn} onRestart={() => setConfirmingRestart(true)} />
      <div className="mt-16 md:mt-5">
        <Board
          board={game.board}
          turn={turn}
          playable={!result && !cpuToMove}
          winningLine={result?.kind === "win" ? result.line : null}
          autoFocus={autoFocus}
          onPlay={(cell) => dispatch({ type: "play", cell })}
        />
      </div>
      <div className="mt-5">
        <Scoreboard game={game} />
      </div>
      <output className="sr-only">{announced.text}</output>
      {result && (
        <RoundResultDialog
          key={game.round}
          game={game}
          result={result}
          onQuit={onQuit}
          onNextRound={() => dispatch({ type: "next-round" })}
        />
      )}
      {confirmingRestart && (
        <RestartDialog
          onCancel={() => setConfirmingRestart(false)}
          onRestart={() => {
            setConfirmingRestart(false);
            dispatch({ type: "restart" });
          }}
        />
      )}
    </div>
  );
}
