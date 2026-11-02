"use client";

import { openResumeGate } from "@/lib";
import { useEffect, useState } from "react";
import GameScreen from "./game-screen";
import NewGameMenu from "./new-game-menu";
import useHydrated from "./use-hydrated";
import useSession from "./use-session";

type Arrival = "load" | "start" | "quit";

export default function TicTacToe() {
  const [session, dispatch] = useSession();
  const [arrival, setArrival] = useState<Arrival>("load");
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated) openResumeGate();
  }, [hydrated]);

  if (session.screen === "menu") {
    return (
      <NewGameMenu
        player1={session.player1}
        focusOnMount={arrival === "quit"}
        onStart={(player1, opponent) => {
          setArrival("start");
          dispatch({ type: "start", player1, opponent });
        }}
      />
    );
  }

  return (
    <GameScreen
      game={session.game}
      autoFocus={arrival === "start"}
      dispatch={dispatch}
      onQuit={() => {
        setArrival("quit");
        dispatch({ type: "quit" });
      }}
    />
  );
}
