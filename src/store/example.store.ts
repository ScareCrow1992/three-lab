import {create} from "zustand"

type TState = {
  count : number;
}

type TAction = {
  IncreaseNumber : ()=>void;
  DecreaseNumber : ()=>void;
}



export const useExampleStore = create<TState & TAction>((set)=> ({
  count : 0,
  IncreaseNumber : ()=>set((state)=> ({count : state.count + 1})),
  DecreaseNumber : ()=>set((state)=> ({count : state.count + 1}))
}))

