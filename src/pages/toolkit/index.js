import React, { useEffect, useState } from 'react';

import CpInputContent from '../../components/CpTwitterForm/CpInputContent';
import { useDispatch, useSelector } from 'react-redux';
import optionDataUrl from "../../mockData/optionDataUrl";
import { useParams } from 'react-router';
import { setSelectedToolObject } from '../../utils/store/reducers/ToolKitStateSlice';
import CpContentPanel from '../../components/CpTwitterForm/CpContentPanel';
import '../../components/CpTwitterForm/CpForm.scss';
import { getOptionData } from '../../api/apis/landing';
import CpTabs from '../../components/CpTabs';
import BsModal from '../../components/BsModel';

const ToolKitPage = () => {
  const { category, toolkitType } = useParams();
  const toolkitState = useSelector((state) => state.toolkit);
  const selectedToolObject = toolkitState?.selectedToolObject;
  const [state, setState] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const postContentData = useSelector((state) => state.toolkit.postContentData);
  const [downloadPopupUrl, setDownloadPopupUrl] = useState('');

  const dispatch = useDispatch();
  // User Lands directly to toolkit page
  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const response = await getOptionData();
        const categoryFromUrl = Object.keys(optionDataUrl).find(
            key => optionDataUrl[key] === category
        );
        const selectedValue = response.data[categoryFromUrl];
        
        const toolkit = categoryFromUrl === 'Design Image' ?  
          selectedValue.Options.find(
            value => value.Route.split('/')[2] === toolkitType
          ): selectedValue.Options.find(
            value => value.Route.split('/')[1] === toolkitType
          );
        if (toolkit) {
          const renderValue = { ...toolkit, Baseroute: selectedValue.Baseroute };
          dispatch(setSelectedToolObject(renderValue));
            
        } else {
          console.warn("No matching toolkit found for the given type.");
        }
      } catch (error) {
        console.error("Error fetching config data:", error);
      }
    };

    fetchConfigData();
}, [category, toolkitType]); // Added dependencies

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    if(downloadPopupUrl === 'reload') {
      window.location.reload();
    } else {
      navigator(downloadPopupUrl);
    }
  };

  // useEffect(() => {
  //   const handleEndConcert = (e) => {
      
  //     setIsModalOpen(true);
  //     e.preventDefault()
  //     // handleModal(true, window.location.reload);

  //   }
  
  //   console.log("use effect called");
  
  //   window.addEventListener('beforeunload', handleEndConcert);
  
  //   return () => {
  //     // hit endpoint to end show
  //     window.removeEventListener('beforeunload', handleEndConcert);
  //   }
  // }, []);

  const handleModal = (val, urlToRedirect) => {
    setIsModalOpen(val);
    setDownloadPopupUrl(urlToRedirect);
  }

  const modelCloseFnc = (value) => {
    setIsModalOpen(value);
  };

  return (
    <div className='page-content grey-bg'>
        <div className='toolkit-wrap'>
        {
          selectedToolObject !== null && 
          <>          
            {/* left panel/input container */}
            <CpInputContent 
            setState={(val) => setState(val)}
            handleModal={(value, url) => handleModal(value, url)}
            loaderState={state}
            isModalOpen={isModalOpen}
            />
            {/* Result, Loader, pending, whoa's container */}
            <CpContentPanel 
            state={state} 
            postResponse={toolkitState} 
            toolkitType={toolkitType}
            handleModal={(value, url) => handleModal(value, url)}
            setState={(val) => setState(val)}
            />
            {
              postContentData !== null &&
              <BsModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                downloadData={postContentData.Message} 
                modelClose={modelCloseFnc}
                />
            }
          </>
        }
      </div>
    </div>
);
}

export default ToolKitPage;
