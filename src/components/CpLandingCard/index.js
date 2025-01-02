import React, { useState, useEffect } from "react";
import "../CpLandingCard/CpLandingCard.scss";
import { useDispatch } from "react-redux";
import { setSelectedToolObject } from "../../utils/store/reducers/ToolKitStateSlice";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import useGA4DataLayer from '../hooks/useGA4DataLayer';

const CpLandingCard = (props) => {
  const { optionData, category, handlePlaceholderText } = props;

  const [activeIndex, setActiveIndex] = useState(0); // Track the active card index
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.user);
  // DataLayer start
  const datalayerGA4 = useGA4DataLayer()
  const handleDataLayerGA4 = (dataLayerObj) => {
    datalayerGA4.setAllData(dataLayerObj);
  };
  const toolkit = useSelector((state) => state.toolkit);
  const selectedCat = toolkit.selectedCategory;
  const selectedInput = toolkit.searchInputValue;

  useEffect(() => {
    // Reset activeIndex when the category changes
    setActiveIndex(0);
    handlePlaceholderText(optionData.Options[0].Name);
    dispatch(setSelectedToolObject({ ...optionData.Options[0], Baseroute: optionData.Baseroute }));
  }, [category, optionData]);

  if (!optionData) {
    return <div>No data available for the selected category.</div>;
  }

  // Extracting features from optionData
  const featureList = optionData.Options || [];

  // Check if the current category is "Open Research"
  const isOpenRecent = category === "Open Research";

  const handleCardClick = (index, feature) => {
     console.log(' i am ul li ++')
    setActiveIndex(index); // Update the active card index when a card is clicked
    handlePlaceholderText(feature.Name);
    dispatch(setSelectedToolObject({ ...feature, Baseroute: optionData.Baseroute }));
    if (isOpenRecent) {
      handleDataLayerGA4({
        event: "default_usecase_selection",
        destination_page_url: `${feature.PageRoute}`,
        usecase_selection: feature.Name,
        topic_text: selectedInput,
        // topic_text1:"",
        // topic_text2:"",
      });
      // need to change once all working
      navigate(`${feature.PageRoute}`);
    } else {
      handleDataLayerGA4({
        event: "prompt_interaction",
        destination_page_url: "NA",
        field_name: selectedCat.label,
        field_selection: feature.Name,
        field_type: "NA",
      });
    }
  };

  return (
    <>
      <ul className={`feature-list ${!isOpenRecent ? "typ-2" : ""}`}>
        {featureList.length > 0 ? (
          featureList.map((feature, index) => (
            <li className="feature-item" key={index} >
              <div
                className={`feature-card ${"typ-" + feature.Icon} ${!isOpenRecent ? "typ-pill" : ""
                  } ${activeIndex === index ? "active" : ""}`}
                  onClick={() => {
                    handleCardClick(index, feature);
                  }}
              >
                <div className={`icon ${feature.Icon}`}></div>
                <div className="title">{feature.Name}</div>
              </div>
            </li>
          ))
        ) : (
          <li>No features available for this category.</li>
        )}
      </ul>
    </>
  );
};

export default CpLandingCard;
