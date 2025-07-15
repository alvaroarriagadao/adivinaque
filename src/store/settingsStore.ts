import { create } from 'zustand';

interface SettingsState {
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
})); 