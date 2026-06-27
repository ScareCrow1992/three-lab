import { create } from "zustand";
import type { Object3D } from "three";

type BokehIgnoreState = {
  ignores: Object3D[];
};

type BokehIgnoreAction = {
  add: (object: Object3D) => void;
  remove: (object: Object3D) => void;
  clear: () => void;
};

type BokehIgnoreStore = BokehIgnoreState & BokehIgnoreAction;

export const useBokehIgnoreStore = create<BokehIgnoreStore>((set) => ({
  ignores: [],
  add: (object) =>
    set((state) => {
      if (state.ignores.includes(object)) {
        return state;
      }

      return {
        ignores: [...state.ignores, object],
      };
    }),
  remove: (object) =>
    set((state) => ({
      ignores: state.ignores.filter((ignored) => ignored !== object),
    })),
  clear: () => set({ ignores: [] }),
}));
