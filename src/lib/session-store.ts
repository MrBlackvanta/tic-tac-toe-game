import {
  FIRST_VISIT,
  parseSession,
  sessionReducer,
  type Session,
  type SessionAction,
} from "./session";

export const STORAGE_KEY = "tic-tac-toe:session";

export const RESUME_GATE_TIMEOUT = 2000;

export const RESUME_GATE_SCRIPT = `try{if(JSON.parse(localStorage.getItem("${STORAGE_KEY}")).screen==="game"){var r=document.documentElement;r.dataset.resuming="";setTimeout(function(){delete r.dataset.resuming},${RESUME_GATE_TIMEOUT})}}catch(e){}`;

export function openResumeGate() {
  document.documentElement.removeAttribute("data-resuming");
}

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function save(session: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export function createSessionStore() {
  let session: Session | undefined;
  const listeners = new Set<() => void>();

  const getSnapshot = () =>
    (session ??= parseSession(readSaved()) ?? FIRST_VISIT);

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    getServerSnapshot: () => FIRST_VISIT,
    dispatch: (action: SessionAction) => {
      const current = getSnapshot();
      const next = sessionReducer(current, action);
      if (next === current) return;

      session = next;
      save(next);
      for (const listener of listeners) listener();
    },
  };
}
