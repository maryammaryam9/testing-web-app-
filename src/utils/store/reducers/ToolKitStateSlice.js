import { createSlice } from "@reduxjs/toolkit";

const initialState = {
selectedCategory: {},
selectedToolObject: {},
formData: {},
postContentData: null,
generateCtaDisableRedux: false,
latestPost: null,
searchInputValue:''
};

export const toolKitStateSlice = createSlice({
  name: "toolkit",
  initialState: initialState,
  reducers: {
    setSelectedToolObject: (state, action) => {
      return { ...state, selectedToolObject: action.payload };
    },
    setFormData: (state, action) => {
      return { ...state, formData: action.payload };
    },
    setPostContentData: (state, action) => {
      return { ...state, postContentData: action.payload };
    },
    setGenerateCtaDisableRedux: (state, action) => {
      return { ...state, generateCtaDisableRedux: action.payload };
    },
    setLatestPost: (state, action) => {
      return {...state, lastestPost: action.payload};
    },
    setSelectedCategory: (state, action) => {
      return {...state, selectedCategory: action.payload};
    },
    setSearchInputValue: (state, action) => {
      return {...state, searchInputValue: action.payload};
    },
    resetAll: () => initialState,
  },
});

export const { 
  selectedToolObject,
  setSelectedToolObject,
  formData,
  setFormData,
  postContentData,
  setPostContentData,
  contentPanelState,
  setContentPanelState,
  generateCtaDisable,
  setGenerateCtaDisableRedux,
  setLatestPost,
  selectedCategory,
  setSelectedCategory,
  searchInputValue,
  setSearchInputValue
} = toolKitStateSlice.actions;
export default toolKitStateSlice.reducer;
