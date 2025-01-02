import { getAPI } from "../../index";
import { CHAT_HISTORY_URL, OPTION_DATA, USER_HISTORY_URL } from "../apiUrls/apiUrls";

export const getChatHistoryByUserID = async () => {
    let response = await getAPI(USER_HISTORY_URL + `${JSON.parse(localStorage.getItem("userInfo")).id}`, true);
    return response;
};

export const getOptionData = async () => {
    let response = await getAPI(OPTION_DATA);
    return response;
};

export const getChatHistoryByChatID = async () => {
    let response = await getAPI(CHAT_HISTORY_URL + `${localStorage.getItem("chat_id")}`, true);
    return response;
};