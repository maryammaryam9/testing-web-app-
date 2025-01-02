import { combineReducers } from "redux";
import userReducer from "./UserSlice";
import bucketReducer from "./BucketSlice";
import headerReducer from "./HeaderStateSlice";
import  toolKitReducer  from "./ToolKitStateSlice";

const rootReducer = combineReducers({
  user: userReducer,
  bucket: bucketReducer,
  header: headerReducer,
  toolkit: toolKitReducer
});

export default rootReducer;
