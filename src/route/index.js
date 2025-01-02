import React, { useLayoutEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Layouts from "../layout/index";
import Login from "../pages/login/index";
import LandingPage from "../pages/landing";
import ToolKitPage from "../pages/toolkit";
import OpenSearchChat from "../pages/open-search-chat/index";

const Pages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (!isLoggedIn && location.pathname !== "/login") {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
    // if (location.pathname !== "/globalChat" && !global) {
    //   localStorage.removeItem("global");
    // }
  }, [location, isLoggedIn, location.pathname, navigate]);

  // useLayoutEffect(() => {
  //   setSelectedChatId("");
  // }, [global, location.pathname]);

  // useEffect(() => {
  //   setSelectedChatId("");
  // }, [newChat]);

  // const handleChats = (id) => {
  //   setSelectedChatId(id);
  //   setNewChat(false);
  // };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/TwitterPost" element={<TwitterPost />} /> */}

      {isLoggedIn ? (
        <Route
          path="/"
          element={
            <Layouts />
          }
        >
        <Route index element={<LandingPage />} />

        {/* toolkit routes */}
        <Route path="/toolkit/:category/:toolkitType" element={<ToolKitPage />} />

        {/* open search routes */}
        <Route path="/open-search-chat" element={<OpenSearchChat />} />

        </Route>
       ) : null} 
      {!isLoggedIn && <Route path="*" element={<Navigate to="/login" replace />} />}
    </Routes>
  );
};
export default Pages;
