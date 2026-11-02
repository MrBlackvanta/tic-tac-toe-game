import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

export default function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
