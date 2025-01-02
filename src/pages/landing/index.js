import React, { useEffect, useState } from "react";
import CpWelcomePanel from "../../components/CpWelcomePanel";
import SideBar from "../../components/baseComponents/SideBar/sidebar";
import { getChatHistoryByUserID } from "../../api/apis/landing";
import { useNavigate } from 'react-router';

const LandingPage = () => {
  const [chatHistoryData, setChatHistoryData] = useState([]);

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
  
    // Call the async function
    fetchData();
  }, []);
  const navigate = useNavigate();
  
  const handleHistoryClick = (searchText,chat_id) => {
    localStorage.setItem("chat_id", chat_id);
    navigate("/open-search-chat", {
      state: { landingSidebarValue: searchText },
    });
};
  
  return (
    <>     
      {/* <CpHeader />     */}
      <div className="bs-sec typ-home">
      <SideBar data={chatHistoryData} handelLink={handleHistoryClick} />
      <CpWelcomePanel/>
      </div>
    </>
  )
}

export default LandingPage