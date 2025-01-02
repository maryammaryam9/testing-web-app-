import { postAPI } from "../../index";
import { LOGIN_URL, LOGOUT_URL, SAVE_MY_SPOT, USER_EXIST_URL, USER_GET_OTP_URL, USER_OTP_VERIFY_URL } from "../apiUrls/apiUrls";

export const userLogin = async (body) => {
  let response = await postAPI(LOGIN_URL, body, false);
  return response;
};

export const userLogout = async () => {
  let response = await postAPI(LOGOUT_URL);
  return response;
};

export const userExistCheck = async (body) => {
  let response = await postAPI(USER_EXIST_URL, body);
  return response;
};

export const userOTPVerification = async (body) => {
  let response = await postAPI(USER_OTP_VERIFY_URL, body);
  return response;
};

export const getOTP= async (body) => {
  let response = await postAPI(USER_GET_OTP_URL, body);
  return response;
};

export const postAllowedUser= async (body) => {
  let response = await postAPI(SAVE_MY_SPOT, body);
  return response;
};