import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
// import { useSearchParams, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from "react-redux";
import "../CpOpenSearchChat/CpOpenSearchChat.scss";
import ellipseImg from "../../assets/images/pulse-profile.svg";
import Loader from "../baseComponents/Loader";
import OpenSearch from "../baseComponents/Search/openSearch";
import { postOpenSearch, postOpenSearchCrisp } from "../../api/apis/openSearch";
import { getChatHistoryByChatID } from "../../api/apis/landing";
import CopyToClipboard from 'react-copy-to-clipboard';
import useFileDownload from '../hooks/useFileDownload';
import { downloadFileToLocal } from '../../api/apis/toolkit';
import { setNewResearch ,setUpdateHistory} from "../../utils/store/reducers/HeaderStateSlice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import '../../assets/sass/ChatResponse.scss'
import useGA4DataLayer from "../hooks/useGA4DataLayer";
import { useNavigate } from 'react-router';



const CpOpenSearchChat = (props, { typClass }) => {
  const dispatch = useDispatch();

  const sectionRef = useRef(null);
  // const dropdownRef = useRef(null);
  const [generate, setGenerate] = useState(false);
  // const [inputQuery,setInputQuery] = useState("")
  const [responseData, setResponseData] = useState([]);
  const [isSideBarRes, setIsSidebarRes] = useState(false);
  const [openSerchInputText,setOpenSerchInputText] = useState("");
  const [openSerchResponseText,setOpenSerchResponseText] = useState("");
  const [curChatID,setCurChatID] = useState("")

  const [openDropdown, setOpenDropdown] = useState({});

  const [openRefreshDropdown, setOpenRefreshDropdown] = useState({});

  const [copyState, setCopyState] = useState(false);
  const [formatValue, setFormatValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const userInfo = useSelector((state) => state.user);

  // DataLayer start
  const datalayerGA4 = useGA4DataLayer()
  const handleDataLayerGA4 = (dataLayerObj) => {
    datalayerGA4.setAllData(dataLayerObj);
  };

  const navigate = useNavigate();

  // DataLayer end 
  const dataLayerObjFeatureClick = (event, interaction_type, optionValue,response_count ) => {
    handleDataLayerGA4({
    event: event ? event : "response_generated_interaction", 
    tool_type:"Open Search",
    tool_subtype:"Open Search",
    llm_model:"",
    response_type:"NA",
    interaction_type: interaction_type,
    option_preference: optionValue,
    response_count: response_count ? response_count:"NA",
    destination_page_url: "NA"
    });
  }
  const recentHistoryPanelStatus = useSelector(
    (state) => state.header?.isRecentHistoryPanelOpen
  );

  const newResearchStatus = useSelector(
    (state) => state.header?.newResearch
  );

  useEffect(() => {
    newResearchStatus && setResponseData([]);
  }, [newResearchStatus]);


  const location = useLocation();
  let inputValue,landingSidebarValue = "";
  if (location) {
    inputValue = location?.state?.inputValue;
    landingSidebarValue = location?.state?.landingSidebarValue;
  }
  
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setOpenDropdown(false);
  //     }
  //   };

  //   document.addEventListener('click', handleClickOutside);

  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //   };
  // }, []);

  // const navigate = useNavigate();

  useEffect(() => {
    if (sectionRef.current) {
      const contentHeight = sectionRef.current.scrollHeight;
      sectionRef.current.scrollTop = contentHeight;
    }
  }, [responseData]);

  useEffect(() => {
    // const newParams = new URLSearchParams(inputValue);
    // newParams.delete(inputValue);
    // navigate({ search: newParams.toString() });
    // const requestBody = {
    //   query:inputText
    // };
    // let response = await getChatHistoryByChatID();

    if (landingSidebarValue !== "" && landingSidebarValue != null){
      setIsSidebarRes(true)
      fetchOpenSearchData();
      navigate('/open-search-chat', { replace: true, state: { ...location.state, inputValue: null, landingSidebarValue: null } });
    }
    if (props.searchValue !== "" && props.searchValue != null){
      setIsSidebarRes(true)
      fetchOpenSearchData();
      // navigate('/open-search-chat', { replace: true, state: { ...location.state, inputValue: null, landingSidebarValue: null } });
    }
    if (inputValue !== "" && inputValue != null) {
      navigate('/open-search-chat', { replace: true, state: { ...location.state, inputValue: null, landingSidebarValue: null } });
    }


    }, [props.searchValue,inputValue]);

  const fetchOpenSearchData = async () => {
    try {
      setGenerate(true);
      setResponseData([]);
      let res = await getChatHistoryByChatID(); // Wait for the promise to resolve
        let resData = res?.data?.events?.map((event,i) => (
        {
        query: event?.request_data?.query.startsWith("~$ Make this crisp: ") ? 'Crisp' : event?.request_data?.query.startsWith("~$ Make variation of this : ") ? 'Variation' : event?.request_data?.query,  // Extracting the postTopicText as query
        response: event?.endpoint === "flash" ? event?.response_data?.model_response :event?.response_data?.data,    // Extracting the Message as response
        preload: false,
        reload: (i==res.data.events.length-1)? true : false,
        liked: false,
        disliked: false
      }));

      const fltrResData = resData.filter((ele,i)=>{
        return ele;
      })
      const lastItemQuery =  (fltrResData) && fltrResData[fltrResData.length-1].query
      const lastItemResponse =  (fltrResData) && fltrResData[fltrResData.length-1].response
      setOpenSerchInputText(lastItemQuery)
      setOpenSerchResponseText(lastItemResponse)
      // let resData = {
      //   query: res?.data?.events[0]?.request_data?.query,
      //   response: res?.data?.events[0]?.response_data?.data,
      //   preload: true,
      //   reload: true
      // };
      const chatid = localStorage.getItem("chat_id");
      setCurChatID(chatid)
      setResponseData(resData);

      resData.preload = false;

      setGenerate(false);



    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handelOnKeyEnter = (e) => {
    setOpenSerchInputText(e.target.value);
    if (isSideBarRes) {
      // setResponseData([]);

      setIsSidebarRes(false)
    }
  };
  const handelPostOpenSearch = async (inputText) => {
    handleDataLayerGA4({
      event: "prompt_submit",
      destination_page_url: "NA",
      section: "Open Research",
      click_text: "search",
      topic_text: inputText,
      tool_type:"Open Research",
      tool_subtype:"Open Research",
      header_element: "NA",
      topic_text1: "NA",
      topic_text2: "NA",
      prompt_count: "NA"
    });
    dispatch(setNewResearch(false));
    dispatch(setUpdateHistory(true));
    setResponseData([]);

    setGenerate(true);
    let resData = {
      id: new Date(),
      query: inputText,
      response: "",
      preload: true,
      reload: true,
      liked: false,
      disliked: false
    };
    setResponseData([...responseData, resData]);
    if (responseData.length > 0) {
      // setResponseData(prevArray => {return[{...responseData[responseData.length-2], reload: false}]});
      setResponseData(s => s.map((item, idx) =>
        idx === s.length - 2 ? { ...item, reload: false } : item
      ))
    }

    //API call
    const requestBody = {
      query: inputText,
    };
    let responseStartTime , responseStopTime;
    responseStartTime = new Date(); // for now

    let response = await postOpenSearch(JSON.stringify(requestBody),curChatID);
    responseStopTime = new Date(); // for now
    const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
    handleDataLayerGA4({
      event: "prompt_response_generated", 
      tool_type:"Open Search",
      tool_subtype:"Open Search",
      response_type:"NA",
      llm_model:"",
      response_load_time:timeDiff,
      response_count: responseData.length + 1,
      destination_page_url: "NA"
    });
    setCurChatID(response.headers.get('chat-id'));
    resData.response = response.data.data;
    resData.preload = false;
    // handleTypingEffect(resData.id, response.data.data)
    setOpenSerchResponseText(response.data.data);

    dispatch(setUpdateHistory(false));
    setResponseData([...responseData, resData]);
    
    

    if (responseData.length > 0) {
      // setResponseData(prevArray => {return[{...responseData[responseData.length-2], reload: false}]});

      setResponseData(s => s.map((item, idx) =>
        idx === s.length - 2 ? { ...item, reload: false } : item
      ))
    }
    setGenerate(false);
  };

  const handleCrispSearch = async (inputText, refreshType, i) => {
    setGenerate(true);
    let resData = {
      id: new Date(),
      query: refreshType,
      response: "",
      preload: true,
      reload: true,
      liked: false,
      disliked: false
    };
    setResponseData([...responseData, resData]);
    if (responseData.length > 0) {
      // setResponseData(prevArray => {return[{...responseData[responseData.length-2], reload: false}]});
      setResponseData(s => s.map((item, idx) =>
        idx === s.length - 2 ? { ...item, reload: false } : item
      ))
    }
    //API call
    const requestBody = {
      // query: inputText,
      query:"~$ Make this crisp: "+openSerchResponseText
    };

    let responseStartTime , responseStopTime;
    responseStartTime = new Date(); // for now

    let response = await postOpenSearchCrisp(JSON.stringify(requestBody), curChatID);
    resData.response = response.data.model_response;
    responseStopTime = new Date(); // for now
    const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
    handleDataLayerGA4({
      event: "prompt_response_generated", 
      tool_type:"Open Search",
      tool_subtype:"Open Search",
      response_type:"Crisp",
      llm_model:"",
      response_load_time:timeDiff,
      response_count: responseData.length + 1,
      destination_page_url: "NA"
    });
    dataLayerObjFeatureClick("regenerate_response","Crisp",i + 1, timeDiff);
    setOpenSerchResponseText(response.data.model_response);
    resData.preload = false;
    setResponseData([...responseData, resData]);
    // handleTypingEffect(resData.id, response.data.model_response)
    if (responseData.length > 0) {
      // setResponseData(prevArray => {return[{...responseData[responseData.length-2], reload: false}]});
      setResponseData(s => s.map((item, idx) =>
        idx === s.length - 2 ? { ...item, reload: false } : item
      ));
    }
    setGenerate(false);
  };

  const handleVariationSearch = async (inputText, refreshType, i) => {
    setGenerate(true);
    let resData = {
      id:new Date(),
      query: refreshType,
      response: "",
      preload: true,
      reload: true,
      liked: false,
      disliked: false
    };
    setResponseData([...responseData, resData]);
    if (responseData.length > 0) {
      // setResponseData(prevArray => {return[{...responseData[responseData.length-2], reload: false}]});
      setResponseData(s => s.map((item, idx) =>
        idx === s.length - 2 ? { ...item, reload: false } : item
      ))
    }

    //API call
    const requestBody = {
      // query: inputText,
      query: "~$ Make variation of this : " + openSerchResponseText
    };
    let responseStartTime , responseStopTime;
    responseStartTime = new Date(); // for now
    let response = await postOpenSearch(JSON.stringify(requestBody),curChatID);
    resData.response = response.data.data;
    responseStopTime = new Date(); // for now
    const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
    handleDataLayerGA4({
      event: "prompt_response_generated", 
      tool_type:"Open Search",
      tool_subtype:"Open Search",
      response_type:"Variation",
      llm_model:"",
      response_load_time:timeDiff,
      response_count: responseData.length +1,
      destination_page_url: "NA"
    });
    dataLayerObjFeatureClick("regenerate_response","Variation",i + 1 ,timeDiff)

    setOpenSerchResponseText(response.data.data);
    resData.preload = false;

    setResponseData([...responseData, resData]);

    // handleTypingEffect(resData.id, response.data.data)

    if (responseData.length > 0) {
      // setResponseData(prevArray => {return[{...responseData[responseData.length-2], reload: false}]});
      setResponseData(s => s.map((item, idx) =>
        idx === s.length - 2 ? { ...item, reload: false } : item
      ))
    }
    setGenerate(false);
    
  };

  const downloadFile = useFileDownload();
  let handleDownloadFunc = downloadFile.handleDownload;

  const handleDownloadClick = async (displayedDataValue, value, i) => {
    try {
      const requestBody = JSON.stringify({
        "markdown": displayedDataValue,
        "format": value
      })
      let response = await downloadFileToLocal(requestBody);
      if (!response.data.error) {
        handleDownloadFunc(response.data.data_url);
      }
    } catch (err) {
      console.error("Error during API call:", err);
    } finally {
      //   setIsLoading(false); // Set loading state to false after completion
    }
  };

  const stripMarkdown = (text) => {
    text = text.replace(/(#+\s?|={2,}|-{2,})/g, "");
    text = text.replace(/(\*\*|__|\*|_|`|~~)/g, "");
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    text = text.replace(/\|[^|]+\|/g, "");
    return text.trim();
  };

  const isNumber = (value) => {
    return !isNaN(value);
  };

  const prepareCopyContent = (content) => {
    if (typeof content === "string") {
      return isNumber(content) ? parseFloat(content) : stripMarkdown(content);
    }
    return content;

  };

  const handleCopyClick = (i) => {
    setCopyState(true);
    setTimeout(() => setCopyState(false), 2000);
    dataLayerObjFeatureClick("response_generated_interaction", "Copy",i +1 )
  };

  const toggleDropdown = (postId) => {
    setOpenDropdown((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle the specific dropdown
    }));
    setOpenRefreshDropdown((prev) => ({
      ...prev,
      [postId]: false, // Close this specific dropdown
    }));
  };

  const toggleRefreshDropdown = (postId) => {
    setOpenRefreshDropdown((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle the specific dropdown
    }));
    
    setOpenDropdown((prev) => ({
      ...prev,
      [postId]: false, // Close this specific dropdown
    }));
  };

  const closeDropdowns = (event) => {
    // Check if the click is inside any dropdown
    // Object.keys(openDropdown).forEach((postId) => {
    //   const dropdownElement = document.querySelector(`[data-dropdown-id="${postId}"]`);
    //   if (dropdownElement && !dropdownElement.contains(event.target)) {
    //     setOpenDropdown((prev) => ({ ...prev, [postId]: false }));
    //   }
    // });

    // Object.keys(openRefreshDropdown).forEach((postId) => {
    //   const refreshDropdownElement = document.querySelector(`[data-refresh-dropdown-id="${postId}"]`);
    //   if (refreshDropdownElement && !refreshDropdownElement.contains(event.target)) {
    //     setOpenRefreshDropdown((prev) => ({ ...prev, [postId]: false }));
    //   }
    // });
  };

  // useEffect(() => {
  //   document.addEventListener('click', closeDropdowns);

  //   return () => {
  //     document.removeEventListener('click', closeDropdowns);
  //   };
  // }, [openDropdown, openRefreshDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(openDropdown).forEach((postId) => {
        const dropdownElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          // Close only the clicked dropdown
          setOpenDropdown((prev) => ({
            ...prev,
            [postId]: false, // Close this specific dropdown
          }));
        }
      });

      Object.keys(openRefreshDropdown).forEach((postId) => {
        const dropdownElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (dropdownElement && !dropdownElement.contains(event.target)) {
          // Close only the clicked dropdown
          setOpenRefreshDropdown((prev) => ({
            ...prev,
            [postId]: false, // Close this specific dropdown
          }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]); // Dependency is only `openDropdown`


  // const handleTypingEffect = (postId, fullContent) => {
  //   const words = fullContent.split(" ");
  //   let index = 0;
  //   setIsStreaming(true);
  //   console.log("Word at 0", words[0]);
  //   // Find the target post to update
  //   setResponseData((prev) =>
  //     prev.map((item) =>
  //       item.id === postId
  //         ? { ...item, response: words[0] + " " } // Initialize the response field for typing effect
  //         : item
  //     )
  //   );

  // //   setResponseData((prevPosts) =>
  // //     prevPosts.map((post) =>
  // //         post.id === postId
  // //             ? { ...post, response: words[0] + " "} // Initialize with the first word
  // //             : post
  // //     )
  // // );

  //   const interval = setInterval(() => {
  //     setResponseData((prev) =>
  //       prev.map((item) =>
  //         item.id === postId
  //           ? {
  //             ...item,
  //             response: `${item.response || ""}${words[index]} `,
  //           }
  //           : item
  //       )
  //     );

  //     index++;
  //     if (index >= words.length-1) {
  //       clearInterval(interval);
  //       setIsStreaming(false);
  //     }
  //   }, 30); // Delay between word reveal (30ms)

  //   return () => clearInterval(interval);
  // };


  // State to track if the user has clicked thumbs up or thumbs down
  
  const handleTypingEffect = (postId, fullContent) => {
    const words = fullContent.split(" ");
    let index = 0;
    setResponseData((prevPosts) =>
      prevPosts.map((post) =>
          post.id === postId
              ? { ...post, response: words[0] + " "} // Initialize with the first word
              : post
      )
  );
    const interval = setInterval(() => {
      setResponseData((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        response: post.response + words[index -1] + " ",
                    }
                    : post
            )
        );

        
        if (index >= words.length - 1) {
            clearInterval(interval);
            setResponseData((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? { ...post, isTyping: false }
                        : post
                )
            );
        }
        index++;
    }, 30); // Adjust delay as needed
};
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  // Function to handle thumbs up click
  const handleThumbUp = (e,indexValue) => {
    setResponseData(s => s.map((item, idx) =>
      idx === indexValue ? { ...item, liked: true, disliked: false } : item
    ));
    dataLayerObjFeatureClick("response_generated_interaction", "Liked",indexValue +1 )

    const parentLi = e.target.closest("ul"); // Find the closest <li> element
    if (parentLi) {
      // Remove "active" class from all sibling buttons
      parentLi.querySelectorAll("button").forEach((btn) => {
        btn.classList.remove("active");
      });
      // Add "active" class to the clicked button
      e.target.classList.add("active");
    }
  };

  // Function to handle thumbs down click
  const handleThumbDown = (e,indexValue) => {

    setResponseData(s => s.map((item, idx) =>
      idx === indexValue ? { ...item, liked: false, disliked: true } : item
    ));
    dataLayerObjFeatureClick("response_generated_interaction", "Disliked",indexValue +1 )
    // setDisliked(true);
    // setLiked(false); // Ensure thumbs up is not active if thumbs down is clicked

    const parentLi = e.target.closest("ul"); // Find the closest <li> element
    if (parentLi) {
      // Remove "active" class from all sibling buttons
      parentLi.querySelectorAll("button").forEach((btn) => {
        btn.classList.remove("active");
      });
      // Add "active" class to the clicked button
      e.target.classList.add("active");
    }
  }; 
  const LinkRenderer = (props)=> {
    return (
      <a href={props.href} target="_blank" rel="noreferrer">
        {props.children}
      </a>
    );
  }
  return (
    <div className={`cp-open-seacrh typ-2 ${recentHistoryPanelStatus ? "open" : ""}`} >
      <div className="chat-area" ref={sectionRef}>
        {/* <div className="time-stamp">
          <span className="day-date">Today - 11:35 AM</span>       
        </div> */}
        {responseData.map((resData, i) => {
          return (
            <div key={i} data-post-id={i}>
              <div className="chat reply-chat">
                <p className="data">{resData.query}</p>
              </div>
              <div className="chat response-chat">
                <div className="img-wrap">
                  <img src={ellipseImg} alt="ellipseImg" />
                </div>
                <div className="content-wrap">
                  <ReactMarkdown
                    key={0}
                    children={resData.response}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    className={`markdown-section`}
                    components={{ a: LinkRenderer,
                      code(props) {
                        const {children, className, node, ...rest} = props
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                          <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                            style={dark}
                          />
                        ) : (
                          <code {...rest} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  />
                  {/* <p className="data">{resData.response}</p> */}
                  {resData.preload ? <Loader /> : ""}
                  <ul className="icon-list">
                    <li className="icon-item" onClick={() => handleCopyClick(i)}>
                      <CopyToClipboard text={prepareCopyContent(resData.response)}>
                        <button className="icon icon-description"></button>
                      </CopyToClipboard>
                    </li>
                    <li className="icon-item">
                      <button
                        className={`icon icon-thumb_up`}
                        onClick={(e) =>handleThumbUp(e,i)}
                      >

                      </button>
                    </li>
                    <li className="icon-item">
                      <button
                        className={`icon icon-thumb_down`}
                        onClick={(e)=>handleThumbDown(e,i)}
                      >

                      </button>
                    </li>
                    <li className="icon-item">
                      <button
                        className={`icon icon-download ${openDropdown[i] ? 'show' : ''}`}
                        onClick={() => {
                          toggleDropdown(i)
                        }
                        }
                        aria-expanded={openDropdown[i] || false}
                      >
                        {openDropdown[i] && <span className={`arrow icon-chevron-down`} ></span>}
                      </button>

                      {openDropdown[i] && (
                        <ul className="dropdown-menu">
                          {['pdf', 'doc', 'docx', 'html', 'txt'].map((value, index) => {
                            return (
                              <li className="feature-item" key={`${value}_${index}`}
                                onClick={() => {
                                  setFormatValue(value);
                                  dataLayerObjFeatureClick("response_generated_interaction", "Download",i +1 )
                                  handleDownloadClick(resData.response, value, i);
                                }}
                              >
                                <span className='dropdown-val'>{value}</span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                    {resData.reload ?
                      <li className="icon-item">
                        <button
                          className={`icon icon-cached ${openDropdown[i] ? 'show' : ''}`}
                          onClick={() => toggleRefreshDropdown(i)}
                          aria-expanded={openRefreshDropdown[i] || false}
                        >
                          {openRefreshDropdown[i] && <span className={`arrow icon-chevron-down`} ></span>}
                        </button>

                        {openRefreshDropdown[i] && (
                          <ul className="dropdown-menu">
                            <li className="feature-item">
                              <span className='dropdown-val' onClick={() => handleCrispSearch(responseData[responseData.length - 1].query, "Crisp", i)}>Crisp</span>
                            </li>
                            <li className="feature-item">
                              <span className='dropdown-val' onClick={() => handleVariationSearch(responseData[responseData.length - 1].query, "Variation", i)}>Variation</span>
                            </li>
                          </ul>
                        )}

                      </li> : ""}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <OpenSearch
        handelSearch={handelPostOpenSearch}
        disableState={generate}
        defaultValue={inputValue != undefined ? inputValue : ""}
        handelKeyPress={handelOnKeyEnter}
      />
    </div>
  );
};

export default CpOpenSearchChat;
