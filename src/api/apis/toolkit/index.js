import { postAPI } from "../../index";
import { DOWNLOAD_FILE } from "../apiUrls/apiUrls";

export const postGenerateContent = async (url, body) => {
  let response = await postAPI(url, body, true);
  return response;
};

export const downloadFileToLocal = async (body) => {
  let response = await postAPI(DOWNLOAD_FILE, body, true);
  return response;
};