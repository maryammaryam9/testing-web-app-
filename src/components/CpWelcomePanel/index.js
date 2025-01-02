import React, { useState, useEffect } from "react";
import "../CpWelcomePanel/CpWelcomePanel.scss";
import CpLandingCard from "../../components/CpLandingCard";
import Search from "../baseComponents/Search/search";
import optionData from "../../mockData/optionData.json";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedPiles } from "../../utils/store/reducers/HeaderStateSlice";
import { getOptionData } from "../../api/apis/landing";

const CpWelcomePanel = () => {
  const [selectOptions, setSelectOptions] = useState([]);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState("Shoot your question");
  const [selectedCategory, setSelectedCategory] = useState("Open Research");
  const recentHistoryPanelStatus = useSelector((state) => state.header.isRecentHistoryPanelOpen)
  const dispatch = useDispatch();
  const selectedToolObject = useSelector((state) => state.toolkit);
  const [filteredData, setFilteredData] = useState();
  const [responseData , setResponseData] = useState(null);
  // Prepare select options on mount
  // useEffect(() => {
  //   if (
  //     optionData &&
  //     typeof optionData === "object" &&
  //     !Array.isArray(optionData)
  //   ) {
  //     const categoryNames = Object.keys(optionData);
  //     const optionsFromCategories = categoryNames.map((category) => ({
  //       value: category,
  //       label: category,
  //     }));
  //     console.log(optionsFromCategories, "optionsFromCategories 1")
  //     // setSelectOptions(optionsFromCategories);
  //   } else {
  //     console.error("Invalid optionData format:", optionData);
  //   }
  // }, []);


  //  i am commit this just for testing 
    useEffect(() => {
      const fetchConfigData = async () => {
        try {
          const result = await getOptionData();
          const response = result.data;
           console.log(response, ' this is response ');
          setResponseData(response);
          if (
            response &&
            typeof response === "object" &&
            !Array.isArray(response)
          ) {
            const categoryNames = Object.keys(response);
            const optionsFromCategories = categoryNames.map((category) => ({
              value: category,
              label: category,
            }));
            // sort the array and get Open research obj to the top for rendering
            optionsFromCategories.sort((a, b) => (a.value === "Open Research" ? -1 : b.value === "Open Research" ? 1 : 0));
            setSelectOptions(optionsFromCategories);
          } else {
            console.error("Invalid response format:", response);
          }
        } catch (error) {
          console.error("Error fetching config data:", error);
        }
      };
  
      fetchConfigData();
  }, []);


 
  

  const handleSelectChange = (selected) => {
   
     console.log( selected ,' i selected  am  select btm ');

     
    const newCategory = selected || "Open Research";
    setSelectedCategory(newCategory);
  };

  useEffect(() =>{
    if(selectedCategory !== "" && responseData !== null) {
      const filteredData = selectedCategory && responseData[selectedCategory]
        ? responseData[selectedCategory]
        : [];
      setFilteredData(filteredData);
    }
  },[selectedCategory, responseData]);

  const handlePlaceholderText = (holderValue) => {
      console.log(holderValue, ' this is prefix value   .... +++');
    setSelectedPlaceholder(holderValue);
       console.log( selectedPlaceholder, ' this  prefix State ++++');
    dispatch(setSelectedPiles(holderValue));
  };

  useEffect(()=>{
    if (selectedCategory === "Open Research") {
      setSelectedPlaceholder("Shoot your question");
    }
  },[selectedCategory]);

    return (
    <div
      className={`cp-welcome-panel ${recentHistoryPanelStatus ? "open" : ""}`}
    >
      <div className="head-wrap">
        <h2 className="title">Welcome to Sophius!</h2>
        <p className="desc">How may I assist you today?</p>
      </div>
      <Search
        selectOptions={selectOptions}
        onChange={handleSelectChange}
        selectedValue={selectedCategory}
        selectedPlaceholder={selectedPlaceholder}
        selectedToolObject={selectedToolObject}
      />

{/* <Search
  selectOptions={selectOptions}
  onChange={handleSelectChange}
  selectedValue={selectedCategory}
  selectedPlaceholder={selectedCategory || "Select Category"} // Default placeholder text
  selectedToolObject={selectedToolObject}
  prefix={selectedCategory ? `${selectedCategory} - ` : ''} // Adding prefix dynamically
/> */}


      {selectedCategory !== "Open Research" && (
        //  ye wo select py click krny se jo  data show huta hai wo ye hai  jo search field k nechy shwo hu raha hai   
        <CpLandingCard 
      category={selectedCategory} 
      optionData={filteredData} 
      handlePlaceholderText={(holderValue) => handlePlaceholderText(holderValue)}
      />        
      )}
    </div>
  );
};

export default CpWelcomePanel;

