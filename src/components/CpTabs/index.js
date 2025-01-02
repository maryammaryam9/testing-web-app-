import React, { useState } from "react";
import '../CpTabs/CpTabs.scss';
 import CopyToClipboard from "react-copy-to-clipboard";
import { downloadFileToLocal } from "../../api/apis/toolkit";
import useFileDownload from "../hooks/useFileDownload";
import { useSelector } from "react-redux";

const CpTabs = ({calendarData}) => {
    const [activeTab, setActiveTab] = useState(0);
    const [activeWeek, setActiveWeek] = useState(calendarData.tabs[0]);
    const [displayedData, setDisplayedData] = useState(""); // This holds the progressively displayed data.
    const [openDropdown, setOpenDropdown] = useState({});
    const [hiddenButtons, setHiddenButtons] = useState({});
    const [formatValue, setFormatValue] = useState('');
    const [copyState, setCopyState] = useState(false);
    // State to track if the user has clicked thumbs up or thumbs down
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);

    const handleTabClick = (tabIndex, item) => {
        setActiveTab(tabIndex);
        setActiveWeek(item)
    };
    
    const handleCopyClick = () => {
        setCopyState(true);
        setTimeout(() => setCopyState(false), 2000);
    };

    // Function to handle thumbs up click
    const handleThumbUp = () => {
        setLiked(true);
        setDisliked(false); // Ensure thumbs down is not active if thumbs up is clicked
    };

    // Function to handle thumbs down click
    const handleThumbDown = () => {
        setDisliked(true);
        setLiked(false); // Ensure thumbs up is not active if thumbs down is clicked
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

    const handleRefreshPost = async (postId) => {
        try {
            setHiddenButtons((prevState) => ({ ...prevState, [postId]: true }));
            // handleTypingEffect(newPost.id, response.data.Message);
        } catch (err) {
            console.error("Error during API call:", err);
        }
    };

    const handleCopyCLick = () => {
        // Get the table element from the DOM
        // (Use whatever method makes sense for locating your table element, e.g. document.querySelector('table'))
        const tableElement = document.getElementById('media');

        // Convert the table element to an HTML string
        const tableHTMLString = tableElement.outerHTML;

        // Convert the table element to plain text string
        const plainTextString = tableElement.innerText;
        navigator.clipboard.write([
            new ClipboardItem({
                'text/html': new Blob([tableHTMLString], {
                    type: 'text/html',
                }),
                'text/plain': new Blob([plainTextString], {
                    type: 'text/plain',
                }),
            }),
        ]);
    }

    return (
        <>
            <div className="CpTabs" id="media">
                <div className="head-wrap">
                    <h2 className="tab-title">
                        {calendarData?.tabs?.length} Week Social Media Content Calendar:Technology Focus
                    </h2>
                    <ul className="icon-list">
                        <li className="icon-item" onClick={handleCopyClick}>
                            {/* <CopyToClipboard text={prepareCopyContent(displayedData)}> */}
                                <button className="icon icon-description" onClick={handleCopyCLick}></button>
                            {/* </CopyToClipboard> */}
                        </li>
                        <li className="icon-item">
                            <button
                                className={`icon icon-thumb_up ${liked ? 'active' : ''}`}
                                onClick={handleThumbUp}
                            >
                            </button>
                        </li>
                        <li className="icon-item">
                            <button
                                className={`icon icon-thumb_down ${disliked ? 'active' : ''}`}
                                onClick={handleThumbDown}
                            >
                            </button>
                        </li>
                        <li className="icon-item">
                            <button
                                className={`icon icon-download ${openDropdown['firstPost'] ? 'show' : ''}`}
                                onClick={() => toggleDropdown('firstPost')}
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
                                                    handleDownloadClick(displayedData, value);
                                                }}
                                            >
                                                <span className='dropdown-val'>{value}</span>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </li>
                        <li className="icon-item">
                            <button className="icon icon-cached"
                                onClick={() => handleRefreshPost('firstPost')}
                                style={{ display: hiddenButtons['firstPost'] ? 'none' : 'inline-block' }}
                            ></button>
                        </li>
                    </ul>
                </div>
                {/* Tab Menu */}
                <ul className="tab-menu">
                    {calendarData.tabs.map((itemTab, index)=>{
                        return(
                        <li
                            className={activeTab === index ? "active" : ""}
                            onClick={() => handleTabClick(index, itemTab)}
                            key={`${itemTab}_${index}`}
                        >
                            {itemTab}
                        </li>
                        )
                    })
                    }
                </ul>

                {/* Tab Content */}
                {
                    calendarData.data !== undefined &&
                    <div className="tab-container">
                        <div
                            className={`tab-panel ${activeTab === 0 ? "active" : ""}`}
                        >
                                {/* {activeWeek} */}
                            <div className={`table-responsive`}>
                                <table className={`table`}>
                                    <caption>{calendarData.data[activeWeek]?.title !== undefined? calendarData.data[activeWeek].title : ""}</caption>
                                    <thead>
                                        <tr>
                                            {
                                                calendarData.data[activeWeek]?.column_titles?.map((itemTitle, index)=>{
                                                    return (
                                                        <th key={`${`table_head_${index}`}`}>{itemTitle}</th>
                                                    )
                                                })
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                            {
                                                calendarData.data[activeWeek]?.row_data?.map((row_value, index) => {
                                                    return(
                                                        <tr key={`platform_${index}`}>
                                                            <td><span className={`icon ${row_value.Platform}`}></span></td>
                                                            <td>{row_value[1]}</td>
                                                            <td>
                                                                <span className={`post-title`}>{row_value[2].split(':')[0] ? row_value[2].split(':')[0] : ''}:</span> 
                                                                {row_value[2].split(':')[1] ? row_value[2].split(':')[1] : row_value[2]}</td>
                                                            <td>{row_value[3]} </td>
                                                            <td>
                                                                {
                                                                    row_value[4]?.map((hashtag)=>{
                                                                        return(
                                                                            <span className={`hashtag`}>{hashtag}</span>
                                                                        )
                                                                    })
                                                                }
                                                            </td>
                                                            <td>{row_value[5]}</td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
};
export default CpTabs;
