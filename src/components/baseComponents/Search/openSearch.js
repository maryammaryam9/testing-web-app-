import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "select2/dist/css/select2.min.css"; 
import "select2"; 
import "../Search/search.scss"; 
import Select from 'react-select';
import { useNavigate } from "react-router";

const OpenSearch = (props) => {

  const [inputSearchValue, setInputSearchValue] = useState("");
  
useEffect(()=>{
    const val = props.defaultValue ? props.defaultValue : "";
    // setInputSearchValue(val)
    if(val !== ''){
      setTimeout(()=>{
        props.handelSearch(val)
      },1000)
    }
    
    
},[])
   
  return (
    <div className={`cp-search typ-open-search ${props?.typClass}`}>
      <input
        type="text"
        className="input"
        autoComplete="false"
        onChange={(e) => {
          if (e.target.value != "" && e.target.value.trim() != "")
            setInputSearchValue(e.target.value)
          else if (e.target.value === "") 
            setInputSearchValue("");
        }}
        onKeyUp={(e)=>{
          props.handelKeyPress(e)
          if(e.key==="Enter" && !e.shiftKey){
            if(inputSearchValue != "" && inputSearchValue.trim() != "" && !props.disableState){
              props.handelSearch(inputSearchValue)
              setInputSearchValue("")
            }
            
            
          }
        }}
        
        value={inputSearchValue}
      />
     

      <button 
      className={`btn btn-icon ${(inputSearchValue === "") || props.disableState === true ? "disable" : ""}`}
      
      
      onClick={()=>{
        props.handelSearch(inputSearchValue)
        setInputSearchValue("")
        // later add condition for other drowpdown like linked in
      }}
      disabled = {props.disableState || (inputSearchValue==="")}
      >
        <span className="icon-send"></span>
      </button>
    </div>
  );
};

export default OpenSearch;
