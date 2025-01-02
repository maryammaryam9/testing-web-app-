import React from "react";
import CpHeader from "../components/CpHeader";
import { Outlet } from "react-router";

const Layouts = () => {

  return (
   <>
    <CpHeader />    
    <div>
      <Outlet />
    </div> 
   </>
  );
};
export default Layouts;
