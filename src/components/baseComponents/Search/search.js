//
import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "select2/dist/css/select2.min.css"; 
import "select2"; 
import "../Search/search.scss"; 
import Select from 'react-select';
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import useGA4DataLayer from '../../hooks/useGA4DataLayer';
import { setSearchInputValue, setSelectedCategory } from "../../../utils/store/reducers/ToolKitStateSlice";

const Search = (props) => {


  //  console.log(props,' this i props')



  let selectInputValue= '';
  const [selectedOption, setSelectedOption] = useState("");
  const selectRef = useRef(null); 
  const placeholderValue = `${props?.selectedPlaceholder}`;
  const [autoFocusState, setAutoFocusState] = useState(true);
  const [searchSelectedValue, setSearchSelectedValue] = useState(null);
  const [inputSearchValue, setInputSearchValue] = useState("");
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const selectOptions = props.selectOptions || []; // Default to an empty array if undefined
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);
  const selectedCat = useSelector((state) => state.toolkit.selectedCategory);
  const selectedToolObj = useSelector((state) => state.toolkit.selectedToolObject);

  // DataLayer start
  const datalayerGA4 = useGA4DataLayer()
  const handleDataLayerGA4 = (dataLayerObj) => {
    datalayerGA4.setAllData(dataLayerObj);
  };

  const dataLayerSubmitObjClick = (distination_url , inputForValue, tool_subtype) => {
    handleDataLayerGA4({
      event: "prompt_submit",
      destination_page_url: distination_url,
      section: selectedCat.label,
      click_text: "submit",
      topic_text: inputForValue,
      tool_type: selectedCat.label,
      tool_subtype:selectedToolObj?.Name,
      header_element: "NA",
      topic_text1: "NA",
      topic_text2: "NA",
      prompt_count: "NA"
    });
}
  // DataLayer end  
  useEffect(() => {
    if (selectOptions.length > 0) {
      $(selectRef.current).select2({
        placeholder: "Open Research",
        allowClear: true,
        minimumResultsForSearch: -1,
      });

      $(selectRef.current).on("change", (e) => {
        const selectedValue = $(e.target).val();
        handleSelectChange({ target: { value: selectedValue , label: selectedValue} });
      });

      return () => {
        $(selectRef.current).select2("destroy");
      };
    }
  }, [selectOptions]);

  useEffect(() => {
    setSearchSelectedValue(null);
    setMenuIsOpen(false);
    $('.react-select-suggestion__input').show();
    $('.prefix').show();
    console.log($('.prefix').width())

    $('#search-suggestion').css('width', 'calc(100% - ' + ($('.prefix').width() + 210) + 'px)');
  }, [placeholderValue]);

  // useEffect(() => {
  //   const matches = suggestionList.filter((option) =>
  //     option.label.toLowerCase().includes(inputSearchValue.toLowerCase())
  //   );
  //   setFilteredSuggestions(matches); // Triggers re-render
  //   setMenuIsOpen(matches.length > 0);  // Control menu visibility based on matches
  // }, [inputSearchValue]);

  const handleSelectChange = (e) => {

   console.log(e,' this is  select change +++');

    const selected = e.target.value;
    dispatch(setSelectedCategory(selected));
    setSelectedOption(selected);
    setAutoFocusState(true);
    if (props?.onChange) {
      props?.onChange(selected);
    } else {
      console.warn("No onChange handler provided in props");
    }
  };
  // const isButtonDisabled = () => {
  //   return !searchSelectedValue && inputSearchValue.trim() === "";
  // };
  const handleSearchChange = (selectedValue) => {
     console.log( selectedValue , ' this is selectedValue ');

   console.log('handleSearchChange'); 



    setSearchSelectedValue(selectedValue);
    setMenuIsOpen(false);
    $('.react-select-suggestion__input').hide();
    $('.prefix').hide();
    handleDataLayerGA4({
      event: "prompt_interaction",
      destination_page_url: "NA",
      field_name:selectedCat.label,
      field_selection: selectedToolObj.Name,
      field_type: "NA",
    });
  };
  
  const onInputChange = (inputVal) => {
    if (inputVal !== '') {
      setIsButtonActive(true);
      const matches = suggestionList.filter((option) =>
        option.label.toLowerCase().includes(inputVal.toLowerCase())
      );
      setFilteredSuggestions(matches); // Triggers re-render
      setMenuIsOpen(matches.length > 0); // Keep menu open if matches exist      
    } else {
      setIsButtonActive(false);
      setMenuIsOpen(false); // Close menu if input is empty
    }
  }

  let suggestionList = props.selectedToolObject?.selectedToolObject?.Suggestions?.map((value) => ({
    value: value,
    label: value,
  })) || [];

  const searchBtnHandler = (btnSearchValue) => {
    dispatch(setSearchInputValue(btnSearchValue));
    if (props?.selectedValue === "Open Research") {
      navigate("/open-search-chat", {
        state: { inputValue: btnSearchValue },
      });
    } else {
      navigate(`${props.selectedToolObject.selectedToolObject.PageRoute}`, {
        state: { titleField: btnSearchValue},
      });
    }
  }

  useEffect(() => {
    const matches = suggestionList.filter((option) =>
      option.label.toLowerCase().includes(inputSearchValue.toLowerCase())
    );
    setFilteredSuggestions(matches); // Triggers re-render
  }, [inputSearchValue]);
  
  return (
    <div className={`cp-search typ-landing ${props?.typClass}`}>
      {selectOptions.length > 0 && (
        <div className="select-wrap">        
          <select
            ref={selectRef}
            className="bs-select"
            value={selectedOption}
            onChange={handleSelectChange}
          >
            {selectOptions.map((option, index) => (
              <option key={index} value={option.value}
              onClick={()=>{
                 alert(' i am working +++++');
                // console.log(' i am working +++++++ jhgjhgjhgjhghjgjhgjhgjhgjhgjhgjhgjhgjhgjhgsdajgh');
                handleDataLayerGA4({
                  event: "prompt_interaction",
                  destination_page_url: "NA",
                  field_name:"Tool",
                  field_selection:option.label,
                  field_type:"",
                });
              }}
              > 
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {(props?.selectedValue === "Open Research") ?
        <input
          type="text"
          className="input openSearchInput"
          placeholder={'Shoot your question'}
          autoFocus={autoFocusState}
          autoComplete="false"
          onChange={(e) => {
            setInputSearchValue(e.target.value);
            if(e.target.value !== ''){
              setIsButtonActive(true);
            } else{
              setIsButtonActive(false);
            }
          }}
          onKeyDown={(e) => {            
            if (e.key === 'Enter') {
              if(e.target.value !== ''){
                setInputSearchValue(e.target.value);
                searchBtnHandler(e.target.value);                             
              }              
            }
          }}
          value={inputSearchValue}
          ref={searchInputRef}
        />
        :
        <>
          <div className="prefix">
            {placeholderValue}
          </div>
          <Select
            id="search-suggestion"
            className="input"
            value={searchSelectedValue} // This should match an option in `filteredSuggestions`
            isSearchable={true}
            name="searchSuggestion"
            options={filteredSuggestions}
            classNamePrefix="react-select-suggestion"
            autoFocus={true}
            menuIsOpen={menuIsOpen}
            onInputChange={(inputValue, { action }) => {
              if (action === "input-change") {
                setInputSearchValue(inputValue); // Update the input search value
                onInputChange(inputValue); // Trigger your filtering logic
                setMenuIsOpen(inputValue.length > 0); // Open menu if input exists
              }
            }}
            onChange={(selected) => {
               console.log(' mai on change hu select wala ');
              handleSearchChange(selected); // Pass the selected option to your handler
              setMenuIsOpen(false); // Close the dropdown
              setIsButtonActive(true); // Activate the button (if required)
            }}
            onBlur={() => {
              setMenuIsOpen(false); // Close the menu on blur
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.target.value.trim() !== '') {
                  setInputSearchValue(e.target.value); // Update input value
                  searchBtnHandler(e.target.value); // Trigger search functionality
                }
              }
            }}
            noOptionsMessage={() => setMenuIsOpen(false)}
          />
        </>
      }
      <button
        className={`btn btn-icon ${!isButtonActive ? "disable" : ""}`}
        onClick={() => {
  
           console.log(' i am search btn +++++')

          let inputForValue = props?.selectedValue === "Open Research" ? 
          inputSearchValue : 
          searchSelectedValue!==null ? searchSelectedValue?.value : inputSearchValue;
          searchBtnHandler(inputForValue);
          props?.selectedValue === "Open Research" ?
          handleDataLayerGA4(
            '/open-search-chat',
            inputForValue,
            "NA",
          ):
          dataLayerSubmitObjClick(
            `${props.selectedToolObject.selectedToolObject.PageRoute}`,
            inputForValue,
            selectedToolObj.Route
          );
        }}
      >
        <span className="icon-send"></span>
      </button>
    </div>
  );
};

export default Search;
