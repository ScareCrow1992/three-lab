import { create } from "zustand";
import type { BarycentricMaterial } from "./type";

type BarycentricState = {
  type: BarycentricMaterial;
};

type BarycentricAction = {
  setType: (type: BarycentricMaterial) => void;
};

type BarycentricStore = BarycentricState & BarycentricAction;

export const useBarycentricStore = create<BarycentricStore>((set) => ({
  type: "blending",
  setType: (type: BarycentricMaterial) => set(() => ({ type })),
}));
