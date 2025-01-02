import { createSlice } from "@reduxjs/toolkit";

const initialState = {
isRecentHistoryPanelOpen: false,
selectedPiles: "",
newResearch: false,
updateHistory:false,
};

export const headerStateSlice = createSlice({
  name: "header",
  initialState: initialState,
  reducers: {
    setRecentHistoryPanelOpen: (state, action) => {
      return { ...state, isRecentHistoryPanelOpen: action.payload };
    },
    setSelectedPiles: (state, action) => {
      return { ...state, selectedPiles: action.payload };
    },
    setNewResearch: (state, action) => {
      return { ...state, newResearch: action.payload };
    },
    setUpdateHistory: (state, action) => {
      return { ...state, updateHistory: action.payload };
    },

    resetAll: () => initialState,
  },
});

export const { 
  isRecentHistoryPanelOpen, 
  setRecentHistoryPanelOpen, 
  selectedPiles,
  setSelectedPiles,
  setNewResearch,
  setUpdateHistory,
} = headerStateSlice.actions;
export default headerStateSlice.reducer;
