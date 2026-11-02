import { createSessionStore } from "@/lib";
import { useState, useSyncExternalStore } from "react";

export default function useSession() {
  const [store] = useState(createSessionStore);
  const session = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return [session, store.dispatch] as const;
}
