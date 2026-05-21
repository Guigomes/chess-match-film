import {create} from 'zustand';
import type {AppSettings, GameSession} from '../types/chess';
import {DEFAULT_SETTINGS} from '../constants/app';

interface AppState {
  settings: AppSettings;
  activeSession: GameSession | null;
  isOnboardingDone: boolean;
  setSettings: (settings: Partial<AppSettings>) => void;
  setActiveSession: (session: GameSession | null) => void;
  updateActiveSession: (updates: Partial<GameSession>) => void;
  setOnboardingDone: (done: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: DEFAULT_SETTINGS,
  activeSession: null,
  isOnboardingDone: false,

  setSettings: (settings) =>
    set((state) => ({settings: {...state.settings, ...settings}})),

  setActiveSession: (session) => set({activeSession: session}),

  updateActiveSession: (updates) =>
    set((state) => ({
      activeSession: state.activeSession
        ? {...state.activeSession, ...updates}
        : null,
    })),

  setOnboardingDone: (done) => set({isOnboardingDone: done}),
}));
