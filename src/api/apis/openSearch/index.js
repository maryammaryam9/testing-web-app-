import { postAPI, postAPIOpenReserch } from "../../index";
import { OPEN_SEARCH_CHAT, OPEN_SEARCH_CHAT_CRISP } from "../apiUrls/apiUrls";


export const postOpenSearch = async ( body,chatId) => {
  let response = await postAPIOpenReserch(OPEN_SEARCH_CHAT, body,chatId);
  return response;
};

export const postOpenSearchCrisp = async ( body, chatId) => {
  let response = await postAPIOpenReserch(OPEN_SEARCH_CHAT_CRISP, body,chatId);
  return response;
};


