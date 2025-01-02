import React, { useState, useEffect, useRef } from 'react';
import "../CpOpenSearchChat/CpOpenSearchChat.scss";
import ellipseImg from "../../assets/images/pulse-profile.svg";
import { useDispatch, useSelector } from 'react-redux';
import BsModal from "../../components/BsModel/index";
import { downloadFileToLocal, postGenerateContent } from '../../api/apis/toolkit';
import useFileDownload from '../hooks/useFileDownload';
import CopyToClipboard from 'react-copy-to-clipboard';
import mermaid from 'mermaid';
import CpTabs from '../CpTabs';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { Pagination, EffectFade, Navigation } from 'swiper/modules';
import { useParams } from 'react-router';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import '../../assets/sass/ChatResponse.scss'
import { toPng } from 'html-to-image';
import { setGenerateCtaDisableRedux, setLatestPost } from '../../utils/store/reducers/ToolKitStateSlice';
import useGA4DataLayer from '../hooks/useGA4DataLayer';

const CpGeneratedPost = ({setState}) => {
    const {category, toolkitType } = useParams();
    const postContentData = useSelector((state) => state.toolkit.postContentData);
    const toolkitState = useSelector((state) => state.toolkit);
    const selectedToolObject = toolkitState.selectedToolObject;
    const selectedCat = toolkitState.selectedCategory;

    const formData = toolkitState.formData;

    const [displayedData, setDisplayedData] = useState(""); // This holds the progressively displayed data.
    const [isStreaming, setIsStreaming] = useState(false); // To track if the stream is in progress
    const [isDownloadOpen, setDownloadIsOpen] = useState(false);
    const [isGraphView, setIsGraphView] = useState(false);
    const [isImageView, setImageView] = useState(false);
    const [imageArray, setImageArray] = useState([])
    const [openDropdown, setOpenDropdown] = useState({});
    const downloadRef = useRef(null);
    // const [calendarData, setCalendarData] = useState()
    const [imageIndex, setImageIndex] = useState(0);
    // const downloadRef2 = useRef(null);

    const [clonedPosts, setClonedPosts] = useState([]);
    const [hiddenButtons, setHiddenButtons] = useState({});
    const [postCount, setPostCount] = useState(1);
    const [formatValue, setFormatValue] = useState('');
    const [copyState, setCopyState] = useState(false);
    const chartRef = useRef(null);
    const multiChartRef = useRef(null);
    const graphAvailableStatus = postContentData && postContentData.svg;
    const dropdownRefs = useRef({});
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.user);
    const latestPost = useSelector((state) => state?.toolkit?.lastestPost);
    
    // DataLayer start
    const datalayerGA4 = useGA4DataLayer()
    const handleDataLayerGA4 = (dataLayerObj) => {
        datalayerGA4.setAllData(dataLayerObj);
    };    

  // DataLayer end 

    const dataLayerObjFeatureClick = (event , interaction_type, optionValue, responseCount) => {
        handleDataLayerGA4({
        event: event, 
        tool_type:selectedCat.label,
        tool_subtype:selectedToolObject.Name,
        llm_model:"",
        response_type:"NA",
        interaction_type: interaction_type,
        option_preference: optionValue,
        response_count: responseCount ? responseCount :"NA",
        destination_page_url: "NA"
        });
    }
    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true, }); 
      }, []);
    useEffect(() => {
        if (postContentData && postContentData.svg) {
            if (chartRef.current) {
                chartRef.current.innerHTML = postContentData.svg
                setIsGraphView(true);
                let latestPostTemp = {
                    Message: '',
                    svg: postContentData.svg,
                    imagesArray: null
                }
                dispatch(setGenerateCtaDisableRedux(false));
                dispatch(setLatestPost(latestPostTemp));
            }
        }else if (postContentData && postContentData.Message) {
            if (Array.isArray(postContentData.Message)) {
                setImageView(true);
                setImageArray(postContentData.Message);
                let latestPostTemp = {
                    Message: '',
                    svg: '',
                    imagesArray: postContentData.Message
                }
                dispatch(setGenerateCtaDisableRedux(false));
                dispatch(setLatestPost(latestPostTemp));
            } 
            // else {
            //     if (toolkitType === 'calendar') {
            //         setCalendarData(postContentData.Message);
            //     } 
                else {
                    let latestPostTemp = {
                        Message: postContentData.Message,
                        svg: '',
                        imagesArray: null
                    }
                    dispatch(setLatestPost(latestPostTemp));
                    const words = postContentData.Message.split(" ");
                    let index = 0;
                    setIsStreaming(true);
                    dispatch(setGenerateCtaDisableRedux(true));
                    setDisplayedData(words[0] + " ");
                    const interval = setInterval(() => {
                        if (index < words.length - 1) {
                            setDisplayedData((prev) => prev + words[index] + " ");
                            index++;
                        } else {
                            clearInterval(interval);
                            setIsStreaming(false);
                            dispatch(setGenerateCtaDisableRedux(false));
                        }
                    }, 30); // Delay between each character reveal (100ms)

                    return () => clearInterval(interval); // Clean up the interval on unmount
                }
            // }
        }
    }, [postContentData.Message, postContentData.svg]); // Trigger the effect when `responseData` changes

    useEffect(() => {
        const handleClickOutside = (event) => {
            Object.keys(openDropdown).forEach((postId) => {
                const dropdownElement = document.querySelector(`[data-post-id="${postId}"]`);
                if (dropdownElement && !dropdownElement.contains(event.target)) {
                    setOpenDropdown((prev) => ({
                        ...prev,
                        [postId]: false,
                    }));
                }
            });
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [postContentData.Message]);

    // Handle click outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Iterate through all dropdownRefs and close the dropdown if clicked outside
            Object.keys(dropdownRefs.current).forEach((postId) => {
                const dropdownElement = dropdownRefs.current[postId];
                if (dropdownElement && !dropdownElement.contains(event.target)) {
                    setOpenDropdown((prevState) => ({
                        ...prevState,
                        [postId]: false, // Close dropdown for that postId
                    }));
                }
            });
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);


    const cleanMermaidCode = (rawCode) => rawCode.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/<br\/>/g, '<br>').replace(/subgraph\s+"[^"]*"/g, 'subgraph MainHierarchy').replace(/"([\w\s]+)"/g, (_, match) => match.replace(/\s+/g, '')).trim();

    const getGraphSvg = async (mermaidCode) => {
        const cleanedCode = cleanMermaidCode(mermaidCode);
        const id = `mermaid-${Date.now()}`; // Unique ID for rendering
        const { svg } = await mermaid.render(id, cleanedCode); // Extract the 'svg' property from the returned object
        return svg;
    };

    const handleDownload = async (id) => {
        try {
          if (id !== undefined) {
            const ele = document.getElementById(id);
            const pngData = await toPng(ele, {
                quality: 1, // Maximum quality
                pixelRatio: 3, // Increase pixel ratio for higher resolution
            }); // Convert the chart to PNG
            const link = document.createElement('a');
            link.href = pngData;
            link.download = 'chart.png';
            link.click(); 
          } else {
            if (!chartRef.current) {
                alert('Generate a diagram before downloading!');
                return;
            }
            const pngData = await toPng(chartRef.current, {
                quality: 1, // Maximum quality
                pixelRatio: 3, // Increase pixel ratio for higher resolution
            }); // Convert the chart to PNG
            const link = document.createElement('a');
            link.href = pngData;
            link.download = 'chart.png';
            link.click();
          }
        } catch (err) {
          console.error('Error exporting chart to PNG:', err);
          alert('Failed to export PNG. Please try again.');
        }
      };

    const callApi = async() => {
        const url = `${selectedToolObject.Baseroute}${selectedToolObject.Route}`;
        const requestBody = {};
        selectedToolObject.Fields.forEach(field => {
            if(field.name === 'imageCount') {
                requestBody[field.name] = formData[field.name] || 1;
            } else {
                if(formData[field.name] !== ""){
                    requestBody[field.name] = formData[field.name];
                }
            }
        });
        return await postGenerateContent(url, JSON.stringify(requestBody));
    }

    const handleRefreshPost = async (postId) => {
        try {
            dispatch(setGenerateCtaDisableRedux(true));
            setHiddenButtons((prevState) => ({ ...prevState, [postId]: true }));
            setPostCount((prevCount) => prevCount + 1);
            const url = `${selectedToolObject.Baseroute}${selectedToolObject.Route}`;
            const requestBody = {};
            selectedToolObject.Fields.forEach(field => {
                if(field.name === 'imageCount') {
                    requestBody[field.name] = formData[field.name] || 1;
                } else {
                    if(formData[field.name] !== ""){
                        requestBody[field.name] = formData[field.name];
                    }
                }
            });
            let responseStartTime , responseStopTime;
            responseStartTime = new Date(); // for now
            let response = await postGenerateContent(url, JSON.stringify(requestBody));
            if (response.data.Status === "Success") {
                let newPost = {};
                responseStopTime = new Date(); // for now
                const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
                dataLayerObjFeatureClick("regenerate_response", "Refresh", postCount,timeDiff );
                // handleDataLayerGA4({
                //     event: "prompt_response_generated", 
                //     tool_type:selectedCat.label,
                //     tool_subtype:selectedToolObject?.Name,
                //     response_type:"Refresh",
                //     llm_model:"",
                //     response_load_time:timeDiff,
                //     response_count: postCount + 1,
                //     destination_page_url: "NA"
                // });
                if (selectedToolObject.Baseroute === "/api/v1/toolkit/dataviz") {
                    try{
                        response.data.svg = await getGraphSvg(response.data.MermaidCode);
                        newPost = {
                            id: Date.now(),
                            content: "",
                            displayedContent: response.data.svg,
                            isTyping: true,
                            counter: postCount + 1
                        };
                        let latestPostTemp = {
                            Message: '',
                            svg: response.data.svg,
                            imagesArray: null
                        }
                        dispatch(setLatestPost(latestPostTemp));
                        graphAvailableStatus && setIsGraphView(true);
                    } catch (err) {
                        let isPassed = false;
                        for (let i = 0; i < 3; i++) {
                            try {
                                console.log("Came at time" + i);
                                const res = await callApi();
                                response.data.svg = await getGraphSvg(res.data.MermaidCode);
                                newPost = {
                                    id: Date.now(),
                                    content: "",
                                    displayedContent: response.data.svg,
                                    isTyping: true,
                                    counter: postCount + 1
                                };
                                let latestPostTemp = {
                                    Message: '',
                                    svg: response.data.svg,
                                    imagesArray: null
                                }
                                dispatch(setLatestPost(latestPostTemp));
                                graphAvailableStatus && setIsGraphView(true);
                                isPassed = true;
                                break;
                            } catch (err) {
                                console.log("Error in Mermaid", err);
                            }
                        }
                        if (!isPassed) {
                            console.log("Not Passed");
                            response.data.Message = "Oops! Response was not generated. Please try again.";
                            newPost = {
                                id: Date.now(),
                                content: "",
                                displayedContent: response.data.Message,
                                isTyping: true,
                                counter: postCount + 1
                            };
                            graphAvailableStatus && setIsGraphView(true);
                        }
                        
                    }
                    
                    setClonedPosts((prevPosts) => [...prevPosts, newPost]);
                } else if (Array.isArray(response.data.Message)) {
                    newPost = {
                        id: Date.now(),
                        content: "",
                        displayedContent: response.data.Message,
                        isTyping: true,
                        counter: postCount + 1
                    };
                    graphAvailableStatus && setIsGraphView(false);
                    setClonedPosts((prevPosts) => [...prevPosts, newPost]);
                    let latestPostTemp = {
                        Message: '',
                        svg: '',
                        imagesArray: response.data.Message
                    }
                    dispatch(setLatestPost(latestPostTemp));
                } else {
                    let latestPostTemp = {
                        Message: response.data.Message,
                        svg: '',
                        imagesArray: null
                    }
                    dispatch(setLatestPost(latestPostTemp));
                    newPost = {
                        id: Date.now(),
                        content: response.data.Message,
                        displayedContent: "",
                        isTyping: true,
                        counter: postCount + 1

                    }
                    graphAvailableStatus && setIsGraphView(false);
                    setClonedPosts((prevPosts) => [...prevPosts, newPost]);
                    handleTypingEffect(newPost.id, response.data.Message);
                };
                dispatch(setGenerateCtaDisableRedux(false));
                // setState("loaded");
            } else {
                setState("failed");
                dispatch(setGenerateCtaDisableRedux(false));
            }
        } catch (err) {
            console.error("Error during API call:", err);
        }
    };

    const handleTypingEffect = (postId, fullContent) => {
        const words = fullContent.split(" ");
        let index = 0;
        setClonedPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId
                    ? { ...post, displayedContent: words[0] + " ", isTyping: true } // Initialize with the first word
                    : post
            )
        );
        const interval = setInterval(() => {
            setClonedPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                            ...post,
                            displayedContent: post.displayedContent + words[index] + " ",
                        }
                        : post
                )
            );

            index++;

            if (index >= words.length - 1) {
                clearInterval(interval);
                setClonedPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? { ...post, isTyping: false }
                            : post
                    )
                );
            }
        }, 30); // Adjust delay as needed
    };


    // const downloadDropdown = () => setDownloadIsOpen(!isDownloadOpen);
    const toggleDropdown = (postId) => {
        setOpenDropdown((prev) => ({
            ...prev,
            [postId]: !prev[postId], // Toggle the specific dropdown
        }));
    };

    const downloadFile = useFileDownload();
    let handleDownloadFunc = downloadFile.handleDownload;

    const handleDownloadClick = async (displayedDataValue, value) => {
        try {
            const requestBody = JSON.stringify({
                "markdown": displayedDataValue,
                "format": value
            });
            let responseStartTime , responseStopTime;
            responseStartTime = new Date(); // for now
            let response = await downloadFileToLocal(requestBody);
            responseStopTime = new Date(); // for now
            const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
            if (!response.data.error) {
                handleDownloadFunc(response.data.data_url);
            }
        } catch (err) {
            console.error("Error during API call:", err);
        } finally {
            //   setIsLoading(false); // Set loading state to false after completion
        }
    };

    const downloadImage = async(imageUrl) => {
        if (imageUrl) {
          const link = document.createElement('a');
          link.href = imageUrl; // Use the image URL passed as an argument
          link.download = 'downloaded_image.png'; // Set the default file name
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error('No image URL provided for download');
        }
      };

      const handleSlideChange = (swiper) => {
        setImageIndex(swiper.activeIndex);
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

    const handleCopyClick = (option) => {
        dataLayerObjFeatureClick("response_generated_interaction", "Copy", option);
        setCopyState(true);
        setTimeout(() => setCopyState(false), 2000);
    };

    // State to track if the user has clicked thumbs up or thumbs down
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    // Function to handle thumbs up click
  
    const handleThumbUp = (e,option) => {
  
        dataLayerObjFeatureClick("response_generated_interaction", "Liked", option);
    
        // setLiked(true);
        // setDisliked(false); // Ensure thumbs down is not active if thumbs up is clicked
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
    const handleThumbDown = (e,option) => {
        dataLayerObjFeatureClick("response_generated_interaction" , "Disliked", option);

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
        <>
            {
                <div className={`cp-open-seacrh`}>
                    {/* {
                        toolkitType !== 'calendar' ? */}
                            <>
                                <div className="chat response-chat" id='firstPost' data-post-id='firstPost' ref={(el) => { dropdownRefs.current['firstPost'] = el; }}>
                                    <div className="img-wrap">
                                        <img src={ellipseImg} alt="ellipseImg" />
                                    </div>
                                    <div className="content-wrap">
                                        <div ref={chartRef} style={{ width: "100%" }}>
                                        </div>
                                        {!isGraphView && !isImageView && (
                                            // <p className="data">{displayedData}</p>
                                            <ReactMarkdown
                                                key={0}
                                                children={displayedData}
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
                                        )}
                                        {isImageView && (
                                            <div className='image-slider'>
                                                <Swiper
                                                    effect={'fade'}
                                                    draggable={false}
                                                    pagination={{
                                                        type: "custom",
                                                        renderCustom: (swiper, current, total) => {
                                                            const formattedCurrent = current < 10 ? `0${current}` : `${current}`;
                                                            const formattedTotal = total < 10 ? `0${total}` : `${total}`;
                                                            return `<span class="custom-pagination">${formattedCurrent}/${formattedTotal}</span>`;
                                                        },
                                                    }}
                                                    navigation={true}
                                                    modules={[Pagination, EffectFade, Navigation]}
                                                    className="bs-swiper typ-image"
                                                    onSlideChange={handleSlideChange}
                                                >
                                                    {imageArray.map((url, index) => (
                                                        <SwiperSlide key={index}>
                                                            <div className="img-wrap">
                                                                <img alt='' key={url} className="" src={url} />
                                                            </div>
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>
                                            </div>
                                        )}
                                        <ul className="icon-list">
                                            {!isGraphView && !isImageView && (<li className="icon-item" onClick={() => handleCopyClick(1)}>
                                                <CopyToClipboard text={prepareCopyContent(displayedData)}>
                                                    <button className="icon icon-description"></button>
                                                </CopyToClipboard>
                                            </li>)}
                                            <li className="icon-item">
                                                <button
                                                    className={`icon icon-thumb_up`}
                                                    onClick={(e) => handleThumbUp(e,1)}
                                                >

                                                </button>
                                            </li>
                                            <li className="icon-item">
                                                <button
                                                    className={`icon icon-thumb_down`}
                                                    onClick={(e) => handleThumbDown(e,1)}
                                                >

                                                </button>
                                            </li>
                                            {isImageView && (
                                                <li className="icon-item">
                                                <button
                                                    className={`icon icon-download ${openDropdown['firstPost'] ? 'show' : ''}`}
                                                    onClick={() => {
                                                        dataLayerObjFeatureClick("response_generated_interaction", "Download", 1)
                                                        downloadImage(imageArray[imageIndex])
                                                    }
                                                    }
                                                    aria-expanded={openDropdown['firstPost'] || false}
                                                 />
                                                </li>
                                            )}
                                            {isGraphView && (
                                                <li className="icon-item">
                                                    <button
                                                        className={`icon icon-download ${openDropdown['firstPost'] ? 'show' : ''}`}
                                                        onClick={() => {
                                                            dataLayerObjFeatureClick("response_generated_interaction", "DownLoad", 1);
                                                            handleDownload()
                                                        }
                                                        }
                                                        aria-expanded={openDropdown['firstPost'] || false}
                                                    >
                                                        {/* {openDropdown['firstPost'] && <span className={`arrow icon-chevron-down`} ></span>} */}
                                                    </button>
                                                </li>)}
                                            {!isGraphView && !isImageView && (
                                                <li className="icon-item">
                                                    <button
                                                        className={`icon icon-download ${openDropdown['firstPost'] ? 'show' : ''}`}
                                                        onClick={() => {
                                                            toggleDropdown('firstPost')
                                                        }
                                                        }
                                                        aria-expanded={openDropdown['firstPost'] || false}
                                                    >
                                                        {openDropdown['firstPost'] && <span className={`arrow icon-chevron-down`} ></span>}
                                                    </button>

                                                    {openDropdown['firstPost'] && (
                                                        <ul className="dropdown-menu">
                                                            {['pdf', 'doc', 'docx', 'html', 'txt'].map((value, index) => {
                                                                return (
                                                                    <li className="feature-item" key={`${value}_${index}`}
                                                                        onClick={() => {
                                                                            setFormatValue(value);
                                                                            dataLayerObjFeatureClick("response_generated_interaction", "DownLoad", 1)
                                                                            handleDownloadClick(displayedData, value);
                                                                        }}
                                                                    >
                                                                        <span className='dropdown-val'>{value}</span>
                                                                    </li>
                                                                )
                                                            })}
                                                        </ul>
                                                    )}
                                                </li>)}
                                            <li className="icon-item">
                                                <button className="icon icon-cached"
                                                    onClick={() => {
                                                        handleRefreshPost('firstPost');
                                                        // dataLayerObjFeatureClick("regenerate_response", "Refresh", 1);
                                                    }}
                                                    style={{ display: hiddenButtons['firstPost'] ? 'none' : 'inline-block' }}
                                                ></button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {clonedPosts.map((post, index) => (
                                    <div key={post.id} className="chat cloned-chat" data-post-id={post.id} ref={(el) => { dropdownRefs.current[post.id] = el; }}>
                                        <div className='divider'><span className='text'>Option {post.counter}</span></div>
                                        <div className="img-wrap">
                                            <img src={ellipseImg} alt="ellipseImg" />
                                        </div>
                                        <div className="content-wrap">
                                            
                                            {isGraphView && <div id={`chart${index}`} dangerouslySetInnerHTML={{ __html: post.displayedContent.split("</svg>")[0] + "</svg>" }} />}
                                            {!isGraphView && !isImageView && (
                                                <ReactMarkdown
                                                key={0}
                                                children={post.displayedContent}
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
                                                )}
                                            {isImageView && (
                                            <div className='image-slider'>
                                                <Swiper
                                                    effect={'fade'}
                                                    draggable={false}
                                                    pagination={{
                                                        type: "custom",
                                                        renderCustom: (swiper, current, total) => {
                                                            const formattedCurrent = current < 10 ? `0${current}` : `${current}`;
                                                            const formattedTotal = total < 10 ? `0${total}` : `${total}`;
                                                            return `<span class="custom-pagination">${formattedCurrent}/${formattedTotal}</span>`;
                                                        },
                                                    }}
                                                    navigation={true}
                                                    modules={[Pagination, EffectFade, Navigation]}
                                                    className="bs-swiper typ-image"
                                                    onSlideChange={handleSlideChange}
                                                >
                                                    {post.displayedContent.map((url, index) => (
                                                        <SwiperSlide key={index}>
                                                            <div className="img-wrap">
                                                                <img alt='' className="" src={url} />
                                                            </div>
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>
                                            </div>
                                        )}
                                            {/* <p className="data">{post.displayedContent}</p> */}
                                            {/* {post.isTyping && <span className="typing-indicator">Typing...</span>} */}

                                            <ul className="icon-list">
                                                {!isGraphView && !isImageView && (<li className="icon-item" onClick={() => handleCopyClick(index+1)}>
                                                    <CopyToClipboard text={prepareCopyContent(post.displayedContent)}>
                                                        <button className="icon icon-description"></button>
                                                    </CopyToClipboard>
                                                </li>)}
                                                <li className="icon-item">
                                                    <button className="icon icon-thumb_up"
                                                    onClick={(e) => handleThumbUp(e,index+1)}
                                                    ></button>
                                                </li>
                                                <li className="icon-item">
                                                    <button className="icon icon-thumb_down"
                                                        onClick={(e) => handleThumbDown(e,index+1)}
                                                    ></button>
                                                </li>
                                                {isImageView && (
                                                <li className="icon-item">
                                                <button
                                                    className={`icon icon-download ${openDropdown['firstPost'] ? 'show' : ''}`}
                                                    onClick={() => {
                                                        dataLayerObjFeatureClick("response_generated_interaction", "DownLoad", index + 1)
                                                        downloadImage(post.displayedContent[imageIndex])}
                                                    }
                                                    aria-expanded={openDropdown['firstPost'] || false}
                                                 />
                                                </li>
                                            )}
                                                {isGraphView && (
                                                <li className="icon-item">
                                                    <button
                                                        className={`icon icon-download ${openDropdown['firstPost'] ? 'show' : ''}`}
                                                        onClick={() => {
                                                            dataLayerObjFeatureClick("response_generated_interaction", "DownLoad", index+1)
                                                            handleDownload('chart' + index)
                                                        }
                                                        }
                                                        aria-expanded={openDropdown['firstPost'] || false}
                                                    >
                                                        {/* {openDropdown['firstPost'] && <span className={`arrow icon-chevron-down`} ></span>} */}
                                                    </button>
                                                </li>)}
                                                {!isGraphView && !isImageView?  (<li className="icon-item">
                                                    <button
                                                        className={`icon icon-download ${openDropdown[post.id] ? 'show' : ''}`}
                                                        onClick={() => {
                                                            toggleDropdown(post.id)
                                                        }
                                                        }
                                                        aria-expanded={openDropdown[post.id] || false}
                                                    >
                                                        {openDropdown[post.id] && <span className={`arrow icon-chevron-down`} ></span>}
                                                    </button>

                                                    {openDropdown[post.id] && (
                                                        <ul className="dropdown-menu">
                                                            {['pdf', 'doc', 'docx', 'html', 'txt'].map((value, index) => {
                                                                return (
                                                                    <li className="feature-item" key={`${value}_${index}`}
                                                                        onClick={() => {
                                                                            setFormatValue(value);
                                                                            dataLayerObjFeatureClick("response_generated_interaction", "DownLoad", index + 1)
                                                                            handleDownloadClick(post.content, value);
                                                                        }}
                                                                    >
                                                                        <span className='dropdown-val'>{value}</span>
                                                                    </li>
                                                                )
                                                            })}
                                                        </ul>
                                                    )}
                                                </li>) : <></>}
                                                <li className="icon-item">
                                                    {!hiddenButtons[post.id] && (
                                                        <button
                                                            className="icon icon-cached"
                                                            onClick={() => {
                                                                handleRefreshPost(post.id)
                                                            }
                                                            }
                                                            style={{ display: hiddenButtons[post.id] ? 'none' : 'inline-block' }}
                                                        ></button>
                                                    )}
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </>
                            {/* :
                            calendarData !== undefined &&
                            <CpTabs calendarData={calendarData} />
                    } */}
                </div>
            }
        </>
    );

}

export default CpGeneratedPost;
