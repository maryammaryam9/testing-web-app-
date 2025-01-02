import React, { useEffect, useState, useRef } from "react";
import '../CpHeader/CpHeader.scss';
import logoImg from "../../assets/images/sophius-combined-logo.svg";
import { useLocation } from "react-router-dom";
import config from '../../utils/config';
import { OPTION_DATA } from '../../api/apis/apiUrls/apiUrls';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from "react-redux";
import { setNewResearch, setRecentHistoryPanelOpen } from "../../utils/store/reducers/HeaderStateSlice";
import { setSelectedToolObject } from '../../utils/store/reducers/ToolKitStateSlice';
import headerData from '../../mockData/optionData.json';
import useGA4DataLayer from '../hooks/useGA4DataLayer';
import BsModal from "../BsModel";

function CpHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userInfoEmail = localStorage?.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))?.email
    : "U";
  const recentHistoryPanelStatus = useSelector((state) => state.header?.isRecentHistoryPanelOpen);
  const activeMenuStatus = useSelector((state) => state.header);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userInfo = useSelector((state) => state.user);
  const menuRef = useRef(null);
  // DataLayer start
  const datalayerGA4 = useGA4DataLayer()
  const handleDataLayerGA4 = (dataLayerObj) => {
    datalayerGA4.setAllData(dataLayerObj);
  };
  // DataLayer end

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const logoutDropdown = () => setIsOpen(!isOpen);
  const postContentData = useSelector((state) => state?.toolkit?.postContentData);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadPopupUrl, setDownloadPopupUrl] = useState('');

  useEffect(() => {
    if (window.location.pathname === "/open-search-chat") {
      dispatch(setRecentHistoryPanelOpen(true))
    } else {
      dispatch(setRecentHistoryPanelOpen(false))
    }
  }, [window.location.pathname])


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false); // Close the menu if clicked outside
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handelLogout = (e) => {
    e.stopPropagation();
    window.localStorage.clear();
    navigate('/login');
  }

  const location = useLocation();

  const handleModal = (val, urlToRedirect) => {
    setDownloadModalOpen(val);
    setDownloadPopupUrl(urlToRedirect);
  }

  // Close the modal
  const closeModal = () => {
    setDownloadModalOpen(false);
    navigate(downloadPopupUrl);
    window.location.reload();
  };

 const modelCloseFnc = (value) => {
  setDownloadModalOpen(value);
 };
  const handleResearchClick = () => {
    postContentData === null ?
    navigate('/open-search-chat'):
    handleModal(true, "/open-search-chat");
  }

  const handleLogoCLick = () => {
    postContentData === null ?
    navigate('/'):
    handleModal(true, "/");
    
  }

  const handleMenuClick = (route) => {
    if (postContentData === null) {
      navigate(route);
      window.location.reload();
    } else {
      handleModal(true, route);
    }
  }


  useEffect(() => {
console.log(postContentData)

    console.log("Modal State:", downloadModalOpen);
  }, [downloadModalOpen]);
  return (
    <>





    <div className="cp-header">
      <div className="head-wrap">
        <div className="lhs">
          <ul className={`menu-list ${recentHistoryPanelStatus ? 'open' : ''} ${!(window.location.pathname === "/" || window.location.pathname === "/open-search-chat") ? 'typ-width' : ""}`}>
            <li className="menu-item">
              <button className="menu-btn js-open-menu" onClick={() =>{
                toggleMenu()
                handleDataLayerGA4({
                  event: "header_navigation_interaction",
                  destination_page_url: "NA",
                  header_element: "burger menu",
                  section: "burger menu",
                  click_text:"burger menu"
                })
              }} 
              ref={menuRef}
              >
                <span className="icon icon-hamburger"></span>
              </button>
            </li>
            {
              ((window.location.pathname === "/" || window.location.pathname === "/open-search-chat")) &&
              <li className="menu-item">
                <button
                  className="menu-btn js-open-sidebar"
                  onClick={() => {
                    dispatch(setRecentHistoryPanelOpen(!recentHistoryPanelStatus))
                    handleDataLayerGA4({
                      event: "header_navigation_interaction",
                      destination_page_url: "NA",
                      header_element: "Open Research",
                      section: "Open Research",
                      click_text:"Open Research"
                    });
                  }
                  }
                >
                  <span className="menu-text">Open Research</span>
                  <span className="icon icon-dock_to_right"></span>
                </button>
              </li>
            }
          </ul>
        </div>
        <div className="rhs">
          <div className="logo-wrap" onClick={() => {
            handleLogoCLick()
            handleDataLayerGA4({
              event: "header_navigation_interaction",
              destination_page_url: "/",
              header_element: "Sophius",
              section: "Sophius",
              click_text:"Sophius"
            })
          }}
          >
            <img src={logoImg} alt="logo" />
          </div>
          <div className="head-right">
            {
              (window.location.pathname !== "/" && window.location.pathname !== "/open-search-chat") &&
              <button className="open-search"
                onClick={() => {
                  handleResearchClick();
                  handleDataLayerGA4({
                    event: "header_navigation_interaction",
                    destination_page_url: '/open-search-chat',
                    header_element: "Open Research",
                    section: "Open Research",
                    click_text: 'OPEN RESEARCH'
                  });
                }
                }>
                <span className="icon icon-feature_search"></span> <span>OPEN RESEARCH</span>
              </button>
            }{
              (window.location.pathname === "/open-search-chat") ?
              <button className="open-search"
                onClick={() => {
                  handleDataLayerGA4({
                    event: "header_navigation_interaction",
                    destination_page_url: '/open-search-chat',
                    header_element: "Open Research",
                    section: "NEW RESEARCH",
                    click_text: 'NEW RESEARCH'
                  })
                  // dispatch(setNewResearch(true));
                  navigate('/open-search-chat', { replace: true, state: { ...location.state, inputValue: null, landingSidebarValue: null } });
                  window.location.reload()
                }

                }>
                <span className="icon icon-feature_search"></span> <span>NEW RESEARCH</span>
              </button> : <></>
              
            }
            <div className="profile" onClick={logoutDropdown} ref={dropdownRef}>
              {userInfoEmail.charAt(0)}
              {isOpen && (
                <ul className="dropdown-menu">
                  <li className="feature-item">
                    <span className="icon icon-profile"></span>
                    <span>
                      {/* <span className="name">{userInfoEmail.charAt(0)}</span> */}
                      {userInfoEmail}
                    </span>
                  </li>
                  <li className="feature-item" onClick={(e) => handelLogout(e)}>
                    <span className="icon icon-logout"></span>
                    <span >Logout</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={`nav-wrap ${menuOpen ? 'open' : ''}`} >
        <button className="close-icon icon-close" onClick={toggleMenu}></button>
        <ul className="nav-list">
          {Object.keys(headerData).map((categoryKey, index) => {
            const category = headerData[categoryKey];

            // Skip rendering Open Research
            if (category.Category === "Open Research") {
              return null;
            }

            return (
              <li key={index} className="nav-item">
                <h2 className="nav-title">{category.Category}</h2>
                <ul className="inner-list">
                  {category.Options.map((item, itemIndex) => (
                    <li key={itemIndex} className="inner-item">
                      <button
                        // href={item.PageRoute}
                        className={`inner-link ${activeMenuStatus.selectedPiles === item.Name && "active"}`}
                        onClick={() => {
                          handleDataLayerGA4({
                            event: "header_navigation_interaction",
                            destination_page_url: item.PageRoute,
                            header_element: "burger menu",
                            section: category.Category,
                            click_text: item.Name,
                          });
                          handleMenuClick(item.PageRoute);
                        }}
                      >
                        <span className={`icon ${item.Icon}`}></span>{item.Name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
    {
      postContentData !== null &&
      <BsModal isOpen={downloadModalOpen} onClose={closeModal} downloadData={ postContentData } modelClose={modelCloseFnc} />
    }
    </>
  );
}

export default CpHeader;
