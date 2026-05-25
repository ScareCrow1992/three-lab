import { create } from "zustand";

type PickingState = {
  pickingId: number;
  rayCastId: number;
};

type PickingAction = {
  setPickingId: (id: number) => void;
  setRayCastId: (id: number) => void;
};

type PickingStore = PickingState & PickingAction;

export const usePickingStore = create<PickingStore>((set) => ({
  pickingId: 0,
  rayCastId: 0,
  setPickingId: (id: number) => set({ pickingId: id }),
  setRayCastId: (id: number) => set({ rayCastId: id }),
}));
