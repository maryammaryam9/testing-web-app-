import React, { useEffect, useRef, useState } from 'react';
import '../BsModel/BsModel.scss';
import useFileDownload from '../hooks/useFileDownload';
import { downloadFileToLocal } from '../../api/apis/toolkit';
import { useSelector } from 'react-redux';
import { toPng } from 'html-to-image';
import useGA4DataLayer from '../hooks/useGA4DataLayer';

const BsModal = ({ isOpen, onClose, downloadData, modelClose }) => {
  const [modalClose, setModalClose] = useState(false);
  const downloadFile = useFileDownload();
  let handleDownloadFunc = downloadFile.handleDownload;
  const postContentData = useSelector((state) => state?.toolkit?.postContentData);
  const latestPost = useSelector((state) => state?.toolkit?.lastestPost);
  const chartRef = useRef(null);
  const multiChartRef = useRef(null);
  const toolkitState = useSelector((state) => state.toolkit);
  const selectedToolObject = toolkitState.selectedToolObject;
  const selectedCat = toolkitState.selectedCategory;
  // DataLayer start
  const datalayerGA4 = useGA4DataLayer()
  const handleDataLayerGA4 = (dataLayerObj) => {
      datalayerGA4.setAllData(dataLayerObj);
  };    

  const dataLayerObjFeatureClick = (event , interaction_type, responseCount) => {
      handleDataLayerGA4({
      event: event, 
      tool_type:selectedCat.label,
      tool_subtype:selectedToolObject.Name,
      llm_model:"",
      response_type:"NA",
      interaction_type: interaction_type,
      option_preference: "NA",
      response_count: responseCount ? responseCount :"NA",
      destination_page_url: "NA"
      });
  }
// DataLayer end 

  useEffect(() => {
    // Reset modal close state when `isOpen` changes
    if (isOpen) setModalClose(false);
  }, [isOpen]);

  const handleDownloadClick = async () => {
    console.log("Toolkit Message", latestPost.Message);
    try {
      const requestBody = JSON.stringify({
        "markdown": latestPost.Message,
        "format": "pdf"
      })
      let responseStartTime , responseStopTime;
      responseStartTime = new Date(); // for now
      let response = await downloadFileToLocal(requestBody);
      responseStopTime = new Date(); // for now
      const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
      dataLayerObjFeatureClick("response_generated_interaction", "Pop-up Download", timeDiff);

      if (!response.data.error) {
        handleDownloadFunc(response.data.data_url);
        onClose();
      }
    } catch (err) {
      console.error("Error during API call:", err);
    } finally {
      //   setIsLoading(false); // Set loading state to false after completion
    }
  };

  const downloadImage = async () => {
    latestPost.imagesArray.map((img) => {
      const link = document.createElement('a');
      link.href = img; // Use the image URL passed as an argument
      link.download = 'downloaded_image.png'; // Set the default file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    onClose();
  };

  const handleDownload = async (svg) => {
    console.log("Came Inside Download", latestPost.svg);
    try {
      // if (multiChartRef.current) {
      //     multiChartRef.current.innerHTML = latestPost.svg;
        const ele = document.createElement('div');
        ele.innerHTML = latestPost.svg;
        ele.style.width="200%";
        ele.style.display='flex';
        ele.style.justifyContent ='center';

        document.body.appendChild(ele);
          const pngData = await toPng(ele, {
            quality: 1, // Maximum quality
            pixelRatio: 3, // Increase pixel ratio for higher resolution
          }); // Convert the chart to PNG
          // multiChartRef.current.innerHTML = '';
          const link = document.createElement('a');
          link.href = pngData;
          link.download = 'chart.png';
          link.click();
        // }
        onClose();
      
    } catch (err) {
      console.error('Error exporting chart to PNG:', err);
      alert('Failed to export PNG. Please try again.');
    }
  };

useEffect(() => {
  if (postContentData && postContentData?.svg) {
    if (chartRef.current) {
        chartRef.current.innerHTML = postContentData.svg
        // setIsGraphView(true);
    }
}
}, [postContentData?.svg]);

  return (
    <>
      <div className={`BsModal`}>
        <div className={`overlay ${(isOpen && !modalClose) ? 'show' : ''}`} onClick={onClose}></div>

        <div className={`modal ${(isOpen && !modalClose) ? 'show' : ''}`}>
          {/* <button className={`close-btn icon-close`} onClick={()=> setModalClose(true)}></button> */}
          <button className={`close-btn icon-close`} onClick={() => modelClose(false)}></button>
          <div className={`icon icon-warning`}></div>
          <h2 className={`title`}>Heads Up!</h2>
          <p className={`description`}>
            Navigating to another section will cause your response to be lost. Please download your response before proceeding.
          </p>
          <button
            className={`modal-btn`}
            onClick={() => {
              // postContentData.svg ? handleDownload :
              // postContentData.Message ? downloadImage :
              // handleDownloadClick()

              // if(latestPost?.svg){
              //   handleDownload();
              // }

              // else if (latestPost) {
              //   if (Array.isArray(postContentData.Message)) {
              //     downloadImage(postContentData.Message)
              //   } else{
              //     handleDownloadClick()
              //   }
              // }
              if (latestPost?.Message !== '') {
                handleDownloadClick();
              } else if (latestPost?.svg !== '') {
                handleDownload();
              } else if (latestPost?.imagesArray != null) {
                downloadImage();
              }
            }
            }>
            DOWNLOAD RESPONSE
          </button>
          <button
            className={`proceed`} onClick={onClose} >
            Proceed without Downloading
          </button>

          <div ref={multiChartRef}  ></div>
        </div>
      </div>
    </>
  );
};

// // App Component
// const AppModal = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Open the modal
//   const openModal = () => {
//     setIsModalOpen(true);
//   };

//   // Close the modal
//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <div>
//       <button onClick={openModal}>Open Modal</button>
//       <BsModal isOpen={isModalOpen} onClose={closeModal} />
//     </div>
//   );
// };

export default BsModal;