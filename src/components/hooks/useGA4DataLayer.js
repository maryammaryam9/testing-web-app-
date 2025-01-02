import { useState, useEffect, useRef } from 'react'
import { useLocation, useParams } from "react-router-dom";


const useGA4DataLayer = () => {
  // const router = useRoutes();
  const location = useLocation();
  const { toolkitType } = useParams();
  const [pageLevelData, setPageLevelData] = useState({});
  const userInfoId = (localStorage?.getItem("userInfo") !== undefined ? JSON.parse(localStorage.getItem("userInfo"))?.id : '')
  const prevLocation = useRef(null);

  const data = {
    event: '',
    pagetype: '',
  }
  useEffect(() => {
    prevLocation.current = location.pathname;
  }, [location]);

  useEffect(() => {
    let pathRender = location !== "undefined" ? location.pathname : '';

    setPageLevelData({
      source_page_url: pathRender,
      // source_page_url: location !== "undefined" ? location.pathname : '',
      // previous_page_url: document.referrer ? document.referrer : "NA",
      previous_page_url: prevLocation.current || 'NA',
      visitor_id: userInfoId,
      pagetype: pathRender === '/' ? "home_page" : toolkitType
    });
  }, [location, prevLocation, toolkitType, userInfoId])


  const setAllData = (pageData) => {
    for (const key in pageData) {
      data[key] = pageData[key]
    }
    // data["login_trigger"] = "NA"
    // data["login_status"] = "NA"
    // data["destination_page_url"] = pageData["destination_page_url"] ? pageData["destination_page_url"] : "NA"
    pushDataLayer()
  }

  const getData = () => {
    let dataObj = {}
    for (const key in data) {
      if (data[key] !== '') {
        dataObj[key] = data[key]
      }
    }
    for (const key in pageLevelData) {
      if (pageLevelData[key] !== '') {
        dataObj[key] = pageLevelData[key]
      }
    }
    return dataObj
  }

  const resetData = () => {
    for (const key in data) {
      data[key] = ''
    }
  }

  const pushDataLayer = () => {
    if (typeof window !== 'undefined') {
      let dataLayer = ((window).dataLayer) || [];

      let data = getData()
      if (Object.keys(data).length !== 0) {
        dataLayer.push(data);
        resetData()
      }
    }
  }

  return { data, setAllData }

}
export default useGA4DataLayer;



//  ek object or ek function banaya huwa hai jo k export hu ry yaha se 
// means yah abi call huwa hu ga waha py parameters mai data pass kia hu ga 
