import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loggedIn: localStorage.getItem("access_token"),
  user: (localStorage?.getItem("userInfo") ? JSON.parse(localStorage.getItem("userInfo")) : {}),
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    isLoggedIn: (state, action) => {
      return { ...state, loggedIn: action.payload };
    },
    userData: (state, action) => {
      return { ...state, user: action.payload };
    },
    resetAll: () => initialState,
  },
});

export const { isLoggedIn, userData, resetAll } = userSlice.actions;
export default userSlice.reducer;
