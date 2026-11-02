import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vite-plus/test";
import { newGame } from "./game";
import { FIRST_VISIT } from "./session";
import {
  clearSavedSession,
  createSessionStore,
  openResumeGate,
  RESUME_GATE_SCRIPT,
  RESUME_GATE_TIMEOUT,
  STORAGE_KEY,
} from "./session-store";

const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

const START = { type: "start", player1: "o", opponent: "player" } as const;

describe("createSessionStore", () => {
  beforeEach(() => localStorage.clear());

  it("opens the menu on a first visit without saving", () => {
    expect(createSessionStore().getSnapshot()).toBe(FIRST_VISIT);
    expect(saved()).toBeNull();
  });

  it("saves every change and tells subscribers", () => {
    const store = createSessionStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch(START);

    const session = { screen: "game", game: newGame("o", "player") };
    expect(store.getSnapshot()).toEqual(session);
    expect(saved()).toEqual(session);
    expect(listener).toHaveBeenCalledOnce();
  });

  it("restores the saved session on the next visit", () => {
    createSessionStore().dispatch(START);
    createSessionStore().dispatch({ type: "play", cell: 4 });

    expect(createSessionStore().getSnapshot()).toMatchObject({
      game: { board: [null, null, null, null, "x", null, null, null, null] },
    });
  });

  it("falls back to the menu when the save is corrupt", () => {
    localStorage.setItem(STORAGE_KEY, '{"screen":"game"}');

    expect(createSessionStore().getSnapshot()).toBe(FIRST_VISIT);
  });

  it("neither saves nor notifies a move the game refuses", () => {
    const store = createSessionStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: "quit" });

    expect(listener).not.toHaveBeenCalled();
    expect(saved()).toBeNull();
  });

  it("stops notifying after unsubscribe", () => {
    const store = createSessionStore();
    const listener = vi.fn();
    store.subscribe(listener)();

    store.dispatch(START);

    expect(listener).not.toHaveBeenCalled();
  });

  it("keeps playing in memory when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    const store = createSessionStore();

    store.dispatch(START);

    expect(store.getSnapshot()).toMatchObject({ screen: "game" });
  });

  it("prerenders the menu even when a game is saved", () => {
    createSessionStore().dispatch(START);

    expect(createSessionStore().getServerSnapshot()).toBe(FIRST_VISIT);
  });
});

describe("clearSavedSession", () => {
  it("sends the next visit back to the menu", () => {
    createSessionStore().dispatch(START);

    clearSavedSession();

    expect(saved()).toBeNull();
    expect(createSessionStore().getSnapshot()).toBe(FIRST_VISIT);
  });

  it("does nothing when storage throws", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });

    expect(clearSavedSession).not.toThrow();
  });
});

describe("RESUME_GATE_SCRIPT", () => {
  const root = document.documentElement;
  const runGate = () => {
    const script = document.createElement("script");
    script.textContent = RESUME_GATE_SCRIPT;
    document.body.append(script);
    script.remove();
  };

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    openResumeGate();
    vi.useRealTimers();
  });

  it("hides the page before paint when a game is saved", () => {
    createSessionStore().dispatch(START);

    runGate();

    expect(root).toHaveAttribute("data-resuming");
  });

  it.each<[string, string | null]>([
    ["nothing is saved", null],
    ["the menu is saved", JSON.stringify(FIRST_VISIT)],
    ["the save is not JSON", "{"],
  ])("leaves the page visible when %s", (_, saved) => {
    if (saved !== null) localStorage.setItem(STORAGE_KEY, saved);

    runGate();

    expect(root).not.toHaveAttribute("data-resuming");
  });

  it("shows the page anyway if the app never lifts the gate", () => {
    createSessionStore().dispatch(START);
    runGate();

    vi.advanceTimersByTime(RESUME_GATE_TIMEOUT);

    expect(root).not.toHaveAttribute("data-resuming");
  });
});
