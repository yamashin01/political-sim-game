import { create } from 'zustand';

export type ScreenId =
  | 'title'
  | 'party_setup'
  | 'dashboard'
  | 'event'
  | 'policy'
  | 'budget'
  | 'election_result'
  | 'coalition'
  | 'ending'
  | 'help'
  | 'party_info';

export type TurnPhase = 'event' | 'policy' | 'budget' | 'wrap_up';

interface UiState {
  currentScreen: ScreenId;
  previousScreen: ScreenId | null;
  currentPhase: TurnPhase;
  pendingEventQueue: string[];
  resolvingEventId: string | null;
  setScreen: (s: ScreenId) => void;
  goBack: () => void;
  setPhase: (p: TurnPhase) => void;
  enqueueEvents: (ids: string[]) => void;
  startNextEvent: () => string | null;
  finishEvent: () => void;
  resetPhases: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  currentScreen: 'title',
  previousScreen: null,
  currentPhase: 'event',
  pendingEventQueue: [],
  resolvingEventId: null,

  setScreen: (s) =>
    set((state) => ({ previousScreen: state.currentScreen, currentScreen: s })),
  goBack: () =>
    set((state) => ({
      currentScreen: state.previousScreen ?? 'title',
      previousScreen: null,
    })),
  setPhase: (p) => set({ currentPhase: p }),
  enqueueEvents: (ids) => set({ pendingEventQueue: ids }),
  startNextEvent: () => {
    const queue = get().pendingEventQueue;
    if (queue.length === 0) {
      set({ resolvingEventId: null });
      return null;
    }
    const [head, ...rest] = queue;
    set({ resolvingEventId: head ?? null, pendingEventQueue: rest });
    return head ?? null;
  },
  finishEvent: () => set({ resolvingEventId: null }),
  resetPhases: () =>
    set({
      currentPhase: 'event',
      pendingEventQueue: [],
      resolvingEventId: null,
    }),
}));
