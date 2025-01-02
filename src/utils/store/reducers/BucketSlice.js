import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bucketData: {}
};

export const bucketSlice = createSlice({
  name: "bucket",
  initialState: initialState,
  reducers: {
    setBucket: (state, action) => {
      return { ...state, bucketData: action.payload };
    },
    resetAll: () => initialState,
  },
});

export const { setBucket } = bucketSlice.actions;
export default bucketSlice.reducer;
