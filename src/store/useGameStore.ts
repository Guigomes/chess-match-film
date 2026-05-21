import {create} from 'zustand';
import type {GameSession} from '../types/chess';

interface GameState {
  games: GameSession[];
  setGames: (games: GameSession[]) => void;
  upsertGame: (session: GameSession) => void;
  removeGame: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  games: [],

  setGames: (games) => set({games}),

  upsertGame: (session) =>
    set((state) => {
      const idx = state.games.findIndex((g) => g.id === session.id);
      if (idx >= 0) {
        const next = [...state.games];
        next[idx] = session;
        return {games: next};
      }
      return {games: [session, ...state.games]};
    }),

  removeGame: (id) =>
    set((state) => ({games: state.games.filter((g) => g.id !== id)})),
}));
