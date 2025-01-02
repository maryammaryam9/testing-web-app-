import React, { useEffect, useState } from "react";
import SideBar from "../../components/baseComponents/SideBar/sidebar";
import CpOpenSearchChat from "../../components/CpOpenSearchChat";
import { getChatHistoryByChatID, getChatHistoryByUserID } from "../../api/apis/landing";
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from "react-redux";

const OpenSearchChat = () => {
  const [chatHistoryData, setChatHistoryData] = useState([]);
  const [openHistoryData, setOpenHistoryData] = useState();
  const [historySearchValue,setHistorySearchValue] = useState("")
  const updateHistory = useSelector((state) => state.header?.updateHistory);

  useEffect(() => {
    // Define the async function inside the useEffect
    const fetchData = async () => {
      try {
        let res = await getChatHistoryByUserID();  // Wait for the promise to resolve  
        if (!res.error && res?.data && res.data.length > 0) {
          setChatHistoryData(res.data);
          // localStorage.setItem("chat_id", res.data[0].chat_id);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
  
    // Define the async function inside the useEffect
    const fetchOpenSearchData = async () => {
      
      try {
        let res = await getChatHistoryByChatID();  // Wait for the promise to resolve  
        if (!res.error && res?.data) {
          setOpenHistoryData(res.data);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    // Call the async function
    fetchData();
    fetchOpenSearchData();
  }, [updateHistory]);
  const navigate = useNavigate();
  const handleHistoryClick = (searchText,chat_id) => {
    localStorage.setItem("chat_id", chat_id);
    setHistorySearchValue(searchText)
    navigate("/open-search-chat" );
};

  return (
    <>
      <div className="bs-sec typ-home">
        <SideBar data={chatHistoryData} handelLink={handleHistoryClick} />
        {openHistoryData || historySearchValue?
        <CpOpenSearchChat data={openHistoryData} searchValue={historySearchValue} /> :""}
        
        {/* openSearchStatus={openSearchStatus} /> */}
      </div>
    </>
  );
};

export default OpenSearchChat;
