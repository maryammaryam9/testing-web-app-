import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFormData, setGenerateCtaDisableRedux } from '../../utils/store/reducers/ToolKitStateSlice';
import useFormValidation from '../hooks/useFormValidation';
import { postGenerateContent } from '../../api/apis/toolkit';
import { setPostContentData } from '../../utils/store/reducers/ToolKitStateSlice';
import $ from "jquery";
import "select2/dist/css/select2.min.css"; 
import "select2"; 
import useGA4DataLayer from '../hooks/useGA4DataLayer';
import mermaid from 'mermaid';
import { useLocation, useParams } from 'react-router';
import Select from 'react-select';

const CpInputContent = ({setState, handleModal, loaderState, isModalOpen}) => {
    const { category, toolkitType } = useParams();
    const [error, setError] = useState("");
    const toolkitState = useSelector((state) => state.toolkit);
    const selectedToolObj = toolkitState.selectedToolObject;
    const selectedCat = toolkitState.selectedCategory;
    const formData = toolkitState.formData;
    const requiredFields = selectedToolObj?.Fields?.filter(field => field.required);
    const nonRequiredFields = selectedToolObj?.Fields?.filter(field => !field.required);
    const { handleValidation, values, errors } = useFormValidation();
    const userInfo = useSelector((state) => state.user);
    const [weekCounter, setWeekCounter] = useState(1);
    const [generateDisable, setGenerateDisable] = useState();
    const generateCtaDisableRedux = useSelector((state) => state.toolkit.generateCtaDisableRedux); 
    const [defaultTextValue , setDefaultTextValue] = useState('');
    const dispatch = useDispatch();
    const location = useLocation();
    let textAreaMaxLength = 500;
    let generateCtaCount = 0;

    // let topicValue = "";
    useEffect(() => {
        if (location) {
            setDefaultTextValue(location?.state?.titleField);
        } else {
            setDefaultTextValue("");
        }
    },[location]);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: false, suppressErrorRendering: true, }); 
      }, []);
    // DataLayer start
    const datalayerGA4 = useGA4DataLayer()
    const handleDataLayerGA4 = (values) => {
        datalayerGA4.setAllData(values);
    };
    // DataLayer end

    const cleanMermaidCode = (rawCode) => rawCode.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/<br\/>/g, '<br>').replace(/subgraph\s+"[^"]*"/g, 'subgraph MainHierarchy').replace(/"([\w\s]+)"/g, (_, match) => match.replace(/\s+/g, '')).trim();
 

    const getGraphSvg = async (mermaidCode) => {
        const cleanedCode = cleanMermaidCode(mermaidCode);
        // try {
            const id = `mermaid-${Date.now()}`; // Unique ID for rendering
            const { svg } = await mermaid.render(id, cleanedCode); // Extract the 'svg' property from the returned object
            return svg;
        // } catch (err) {
        //     console.log("Erorr", err);
        // }
        
    };

    const callApiAgain = async() => {
            const url = `${selectedToolObj.Baseroute}${selectedToolObj.Route}`;
            const requestBody = {};
            selectedToolObj.Fields.forEach(field => {
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

    function splitIntoChunks(text, chunkSize = 500) {
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        return chunks;
    }

    const handleSubmit = async () => {
        try {
        generateCtaCount = generateCtaCount + 1;
        setState("loading");
        setGenerateDisable(true);
        dispatch(setGenerateCtaDisableRedux(true));
        const url = `${selectedToolObj.Baseroute}${selectedToolObj.Route}`;
        const requestBody = {};
        selectedToolObj.Fields.forEach(field => {
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
        let response = await postGenerateContent(url,JSON.stringify(requestBody));
        if (response.data.Status === "Success") {
            if (selectedToolObj.Baseroute === "/api/v1/toolkit/dataviz") {
                try {
                    response.data.svg = await getGraphSvg(response.data.MermaidCode);
                } catch (err) {
                    // response.data.Message = "Oops! Response was not generated. Please try again.";
                    let isPassed = false;
                    for (let i = 0; i < 3; i++) {
                        try {
                            console.log("Came at time" + i);
                            const res = await callApiAgain();
                            response.data.svg = await getGraphSvg(res.data.MermaidCode);
                            isPassed = true;
                            break;
                        } catch (err) {
                            console.log("Error in Mermaid", err);
                        }
                    }
                    if (!isPassed) {
                        response.data.Message = "Oops! Response was not generated. Please try again.";
                    }
                }
                
            }
            setState("loaded");
            const valueToChunk = requiredFields?.filter((fieldToRender,index) => {
                let tempValue = fieldToRender?.type === "textarea";
                if(tempValue) {
                  return fieldToRender
                } else {
                  return null;
                }
            });
            const chunks = splitIntoChunks(formData[`${valueToChunk[0].name}`], 100);
            handleDataLayerGA4({
                event: "prompt_submit", 
                header_element:"NA",
                section:"NA",
                click_text:"submit",
                topic_text:(chunks[0]),
                topic_text1:(chunks[1] ? chunks[1] : "NA"),
                topic_text2:(chunks[2] ?chunks[2] : "NA"),
                tool_type: selectedCat.label,
                tool_subtype:selectedToolObj?.Name,
                prompt_count: generateCtaCount,
                destination_page_url:"NA"
                }   
            );
            responseStopTime = new Date(); // for now
            const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
            handleDataLayerGA4({
                event: "prompt_response_generated", 
                tool_type:selectedCat.label,
                tool_subtype:selectedToolObj?.Name,
                response_type:"submit",
                llm_model:"",
                response_load_time:timeDiff,
                response_count: generateCtaCount,
                destination_page_url: "NA"
            });
            dispatch(setPostContentData(response.data));
            setGenerateDisable(false);
            dispatch(setGenerateCtaDisableRedux(false));
        } else {
            responseStopTime = new Date(); // for now
            const timeDiff = ((responseStopTime - responseStartTime)/1000).toFixed(2);
            setState("failed");
            setError(response.data.Message);
            dispatch(setGenerateCtaDisableRedux(false));
            handleDataLayerGA4({
                event: "prompt_error_response_generated", 
                tool_type:selectedCat.label,
                tool_subtype:selectedToolObj?.Name,
                response_type:"error",
                llm_model:"",
                response_load_time:timeDiff,
                response_count: generateCtaCount,
                destination_page_url: "NA",
                error_text:response.data.Message
            });
        }
        } catch (err) {
        //   console.error("Error during API call:", err);
        setError("An error occurred while generating the content.");
        dispatch(setGenerateCtaDisableRedux(false));
        } finally {
        //   setIsLoading(false); // Set loading state to false after completion
        }
    };

    const handleFieldChange = (e, type, fieldToRenderName) => {
        console.log("EEEEEEEE", e)
        if(type === 'select') {
            dispatch(setFormData({
                ...formData,
                [fieldToRenderName]: e.value || ''
                }));
        } else {
            dispatch(setFormData({
            ...formData,
            [e.target.name]: e.target.value
            }));
            e.target.classList.remove("disabled");
            handleValidation(e);
        }
    };

    useEffect(() => {
        // Initialize Select2 for all dropdowns with the class '.bs-select'
        const selects = $('.bs-select');
        selects.select2({
            allowClear: true,
            minimumResultsForSearch: -1, // Disable the search bar
        });
    
        // Cleanup: Destroy Select2 instances when component unmounts
        return () => {
            selects.select2('destroy');
        };
    }, []);
    
    const emptyFileld = () =>{
        if(!isModalOpen) {
            // dispatch(setFormData({}))
            postGenerateContent !== null &&
            handleModal(true , 'reload');
        } else {
            setGenerateDisable(false);
            dispatch(setGenerateCtaDisableRedux(false));
        }
        // setTimeout(()=>{
        //     window.location.reload();
        // },1000)
    };

    useEffect(() => {
        return () => {
            emptyFileld();
        };
    }, [isModalOpen]);

    const increment = (fieldUpdateParam) => {
        if(category === 'image') {
            setWeekCounter(prevCount => {
                const updatedCount = prevCount < 4 ? prevCount + 1 : 4;
                dispatch(setFormData({
                    ...formData,
                    [fieldUpdateParam]: updatedCount
                }));
                return updatedCount;
            });
        } else {
            setWeekCounter(prevCount => {
                const updatedCount = prevCount + 1;
                dispatch(setFormData({
                    ...formData,
                    [fieldUpdateParam]: updatedCount
                }));
                return updatedCount;
            });
        }
    };
    
    const decrement = (fieldUpdateParam) => {
        setWeekCounter(prevCount => {
            const updatedCount = prevCount > 1 ? prevCount - 1 : 1;
            dispatch(setFormData({
                ...formData,
                [fieldUpdateParam]: updatedCount
            }));
            return updatedCount;
        });
        
    };

// CTA disableCheck
useEffect(() => {
    const checkGeneratePostCTAState = () =>{
        if(selectedToolObj !== undefined && Object.keys(selectedToolObj)?.length > 0) {
            const missingFields = selectedToolObj?.Fields?.filter(field => field.required && !formData[field.name]);
            if(missingFields?.length > 0 || generateCtaDisableRedux) {
                setGenerateDisable(true);
            } else
            setGenerateDisable(false);
        }
    };
    checkGeneratePostCTAState();
}, [selectedToolObj, formData, generateCtaDisableRedux ])

// setting value to text area while landing to pase from home page search pills
useEffect (() => {
if(defaultTextValue !== "" && defaultTextValue !== undefined && requiredFields !== undefined) {
    let tempTopicDefaultValue = requiredFields?.filter((fieldToRender,index) => {
          let tempValue = fieldToRender?.type === "textarea";
          if(tempValue) {
            return fieldToRender
          } else {
            return null;
          }
    });
    dispatch(setFormData({
        ...formData,
        [tempTopicDefaultValue[0].name]: defaultTextValue
    }));
}
},[defaultTextValue]);

return (
    Object.keys(selectedToolObj)?.length > 0 && 
    <div className='CpForm'>
        <div className='card-header'>
            <h3 className='title'>{selectedToolObj?.Name}</h3>
            <div className='newPost-link'
                onClick={()=> {
                    emptyFileld();
                    handleDataLayerGA4({
                        event: "new_post_generated", 
                        destination_page_url: selectedToolObj?.PageRoute,
                        tool_type: selectedCat.label,
                        tool_subtype: selectedToolObj?.Name,
                    })   
                }}
            >
                <span className='icon icon-edit_square' ></span>New Post</div>
        </div>
        <p className='form-desc'>{selectedToolObj?.Description}</p>
        <div className={`bs-form`}>
            {
                requiredFields.map((fieldToRender,index)=>{
                    let optionRender = fieldToRender.type === "select" && (
                        fieldToRender.options.map((renderValue)=>{
                            let tempObj = {value:renderValue, label: renderValue }
                            return tempObj;
                        })
                    );
                    return (
                        <React.Fragment key={`formFields_${index}`}>
                        { fieldToRender.type === "textarea" ?
                                <React.Fragment>
                                <div className={`form-group text-area ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                                    <label className='form-label'>{fieldToRender.label} 
                                        {fieldToRender.required &&
                                            <span className='text-danger'>*</span>
                                        } 
                                    </label>
                                    <textarea
                                        name={fieldToRender.name}
                                        className={`form-control textarea ${loaderState === "loading" && 'disabled'}`}
                                        placeholder={fieldToRender.placeholder}
                                        onChange={(e) => {
                                            handleFieldChange(e,'textarea',fieldToRender.name)
                                        }}                                       
                                        maxLength={textAreaMaxLength}
                                        value={formData[fieldToRender.name]}
                                        required={fieldToRender.required}
                                        onBlur={() => {
                                            handleDataLayerGA4({
                                                event: "prompt_interaction", 
                                                field_name: fieldToRender.label,
                                                field_selection:formData[fieldToRender.name],
                                                field_type:"Mandatory",
                                            });
                                        }}
                                    ></textarea>
                                     <p className='character-count'>
                                    <span className='count'>{formData[fieldToRender.name]?.length}</span>/{textAreaMaxLength} Characters
                                </p>
                            </div>
                               
                            </React.Fragment>
                          :
                        fieldToRender.type === "select" ?
                            <div className={`form-group ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                            <label className='form-label'>{fieldToRender.label} 
                                {fieldToRender.required && <span className='text-danger'>*</span>}
                            </label>
                            <Select
                                className={`form-control ${loaderState === "loading" && 'disabled'}`}
                                isSearchable={false}
                                name={fieldToRender?.name}
                                options={optionRender}
                                classNamePrefix="react-select-suggestion"
                                autoFocus={false} 
                                placeholder={fieldToRender.placeholder}
                                onChange={(e) => {
                                    handleFieldChange(e,'select',fieldToRender.name)
                                }}
                                required={fieldToRender.required}
                                onBlur={() => {
                                    handleDataLayerGA4({
                                        event: "prompt_interaction", 
                                        field_name: fieldToRender.label,
                                        field_selection:formData[fieldToRender.name],
                                        field_type:"Mandatory",
                                    });
                                }}
                            />
                        </div>
                        :
                        fieldToRender.type === "radio" ?
                        <React.Fragment>
                            <label className='radio-group-label'>{fieldToRender.label} </label>
                            <ul className='radio-group'>
                                {fieldToRender.options.map((tone, index) => (
                                    <li key={index}>
                                        <input
                                            type="radio"
                                            className='radio-btn'
                                            id={tone}
                                            name={fieldToRender.name}
                                            value={tone}
                                            onChange={(e) => {
                                                handleFieldChange(e,'radio',fieldToRender.name)
                                            }}
                                            checked={formData[fieldToRender.name] === tone}
                                            onBlur={()=>{
                                                handleDataLayerGA4({
                                                    event: "prompt_interaction", 
                                                    field_name: fieldToRender.label,
                                                    field_selection:formData[fieldToRender.name],
                                                    field_type:"Mandatory",
                                                })
                                            }}
                                        />
                                        <label htmlFor={tone}>{tone}</label>
                                    </li>
                                ))}
                            </ul>
                        </React.Fragment>
                        :
                        fieldToRender.type === "text" ?
                            <div className={`form-group ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                                <label className='form-label'>{fieldToRender.label} 
                                {fieldToRender.required && <span className='text-danger'>*</span>}
                            </label>
                                <input
                                    type="text"
                                    name={fieldToRender.name}
                                    className={`form-control ${loaderState === "loading" && 'disabled'}`}
                                    placeholder={fieldToRender.placeholder}
                                    id={fieldToRender.name}
                                    onChange={(e) => {
                                        handleFieldChange(e,'text',fieldToRender.name)
                                    }}
                                    required={fieldToRender.required}
                                    autoComplete="off"
                                    onBlur={()=>{
                                        handleDataLayerGA4({
                                            event: "prompt_interaction", 
                                            field_name: fieldToRender.label,
                                            field_selection:formData[fieldToRender.name],
                                            field_type:"Mandatory",
                                        })
                                    }}
                                />
                            </div>
                        :
                        (fieldToRender.type === "number" || toolkitType === 'calendar' || category==='image' ) ?
                            <div className='count-wrap'>
                                <div className={`form-group typ-number first ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                                    <label className='form-label'>{fieldToRender.label} 
                                        {fieldToRender.required && <span className='text-danger'>*</span>}
                                    </label>
                                    <div className='count-input'>
                                        <button 
                                            type="button" 
                                            className={`icon ${(weekCounter <= 1 || loaderState === "loading") ? 'disabled' : ''}`}
                                            onClick={() => {
                                                decrement(fieldToRender.name)
                                                handleDataLayerGA4({
                                                    event: "prompt_interaction", 
                                                    field_name: fieldToRender.label,
                                                    field_selection: weekCounter,
                                                    field_type:"Mandatory",
                                                });
                                            }}
                                            disabled={weekCounter <= 1}
                                        >-</button>
                                        <input
                                            type="number"
                                            name={fieldToRender.name}
                                            className={`form-control`}
                                            id={fieldToRender.name}
                                            required={fieldToRender.required}
                                            readOnly
                                            value={Number(weekCounter) || 1}
                                            max={4}
                                            autoFocus={false} 
                                            defaultValue={Number(weekCounter)}
                                        />
                                        {
                                            category==='image' ?
                                            <button 
                                                type="button" 
                                                className={`icon ${(weekCounter >= 4 || loaderState === "loading") ? 'disabled' : ''}`}
                                                onClick={() => {
                                                    increment(fieldToRender.name)
                                                    handleDataLayerGA4({
                                                        event: "prompt_interaction", 
                                                        field_name: fieldToRender.label,
                                                        field_selection: weekCounter,
                                                        field_type:"Mandatory",
                                                    });
                                                }}
                                                disabled={weekCounter >= 4}
                                            >+</button> :
                                            <button 
                                            type="button" 
                                            className={`icon ${(loaderState === "loading") ? 'disabled' : ''}`}
                                            onClick={() => {
                                                increment(fieldToRender.name)
                                                handleDataLayerGA4({
                                                    event: "prompt_interaction", 
                                                    field_name: fieldToRender.label,
                                                    field_selection: weekCounter,
                                                    field_type:"Mandatory",
                                                });
                                            }}
                                            >+</button>
                                        }
                                    </div>
                                </div>
                            </div>
                            :
                            <></>
                        }
                        </React.Fragment>
                    )
                })
            }
            {
                nonRequiredFields?.length !== 0 &&
                <div className='optional-fields'>
                    <h3>OPTIONAL FIELDS</h3>
                </div>
            }
            {
                nonRequiredFields.map((fieldToRender,index)=>{
                    let optionRender = fieldToRender.type === "select" && (
                        fieldToRender.options.map((renderValue)=>{
                            let tempObj = {value:renderValue, label: renderValue }
                            return tempObj;
                        })
                    );
                    let textAreaMaxLength = 500;
                    return (
                        <React.Fragment key={`formFields_${index}`}>
                        { fieldToRender.type === "textarea" ?
                                <React.Fragment>
                                <div className={`form-group text-area ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                                    <label className='form-label'>{fieldToRender.label} 
                                        {fieldToRender.required &&
                                            <span className='text-danger'>*</span>
                                        } 
                                    </label>
                                    <textarea
                                        name={fieldToRender.name}
                                        className={`form-control textarea ${loaderState === "loading" && 'disabled'}`}
                                        placeholder={fieldToRender.placeholder}
                                        onChange={(e) => {
                                            handleFieldChange(e,'textarea',fieldToRender.name);
                                        }}
                                        maxLength={textAreaMaxLength}
                                        value={formData[fieldToRender.name] || ''}
                                        required={fieldToRender.required}
                                        onBlur={()=>{
                                            handleDataLayerGA4({
                                                event: "prompt_interaction", 
                                                field_name: fieldToRender.label,
                                                field_selection:formData[fieldToRender.name],
                                                field_type:"Optional",
                                            })
                                        }}
                                    ></textarea>
                                        <p className='character-count'>
                                    <span className='count'>{formData[fieldToRender.name]?.length}</span>/{textAreaMaxLength} Characters
                                </p>
                                        </div>
                            
                            </React.Fragment>
                          :
                        fieldToRender.type === "select" ?
                            <div className={`form-group ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                            <label className='form-label'>{fieldToRender.label} 
                                {fieldToRender.required && <span className='text-danger'>*</span>}
                            </label>
                            <Select
                                className={`form-control ${loaderState === "loading" && 'disabled'}`}
                                isSearchable={false}
                                name={fieldToRender.name}
                                options={optionRender}
                                classNamePrefix="react-select-suggestion"
                                placeholder={fieldToRender.placeholder}
                                required={fieldToRender.required}
                                onChange={(e) => {
                                    handleFieldChange(e,'select',fieldToRender.name)
                                }}
                                onBlur={()=>{
                                    handleDataLayerGA4({
                                        event: "prompt_interaction", 
                                        field_name: fieldToRender.label,
                                        field_selection:formData[fieldToRender.name],
                                        field_type:"Optional",
                                    })
                                }}
                            />
                        </div>
                        :
                        fieldToRender.type === "radio" ?
                        <React.Fragment>
                            <label className='radio-group-label'>{fieldToRender.label} </label>
                            <ul className='radio-group'>
                                {fieldToRender.options.map((tone, index) => (
                                    <li key={index}>
                                        <input
                                            type="radio"
                                            className='radio-btn'
                                            id={tone}
                                            name={fieldToRender.name}
                                            value={tone || ''}
                                            onChange={(e)=> {
                                                handleFieldChange(e,'radio',fieldToRender.name)
                                            }}
                                            checked={formData[fieldToRender.name] === tone}
                                            onBlur={()=>{
                                                handleDataLayerGA4({
                                                    event: "prompt_interaction", 
                                                    field_name: fieldToRender.label,
                                                    field_selection:formData[fieldToRender.name],
                                                    field_type:"Optional",
                                                })
                                            }}
                                        />
                                        <label htmlFor={tone}>{tone}</label>
                                    </li>
                                ))}
                            </ul>
                        </React.Fragment>
                        :
                        fieldToRender.type === "text" ?
                            <div className={`form-group ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                                <label className={`form-label`} htmlFor={fieldToRender.name}>{fieldToRender.label}</label>
                                <input
                                    type="text"
                                    name={fieldToRender.name}
                                    className={`form-control ${loaderState === "loading" && 'disabled'}`}
                                    placeholder={fieldToRender.placeholder}
                                    id={fieldToRender.name}
                                    onChange={(e)=>{
                                        handleFieldChange(e,'text',fieldToRender.name)
                                    }}
                                    required={fieldToRender.required}
                                    autoComplete="off"
                                    value={formData[fieldToRender.name] || ''}
                                    onBlur={()=>{
                                        handleDataLayerGA4({
                                            field_name: fieldToRender.label,
                                            event: "prompt_interaction", 
                                            field_selection:formData[fieldToRender.name],
                                            field_type:"Optional",
                                        })
                                    }}
                                />
                            </div>
                        :
                        (fieldToRender.type === "number") ?
                        <div className='count-wrap'>
                            <div className={`form-group typ-number first ${errors[fieldToRender.name] ? 'typ-error' : ''}`}>
                                <label className='form-label'>{fieldToRender.label} 
                                    {fieldToRender.required && <span className='text-danger'>*</span>}
                                </label>
                                <div className='count-input'>
                                    <button 
                                        type="button" 
                                        className={`icon ${(weekCounter <= 1 || loaderState === "loading") ? 'disabled' : ''}`}
                                        onClick={() => {
                                            decrement(fieldToRender.name)
                                            handleDataLayerGA4({
                                                field_name: fieldToRender.label,
                                                event: "prompt_interaction", 
                                                field_selection:weekCounter,
                                                field_type:"Optional",
                                            })
                                        }}
                                        disabled={weekCounter <= 1}
                                    >-</button>
                                    <input
                                        type="number"
                                        name={fieldToRender.name}
                                        className={`form-control`}
                                        id={fieldToRender.name}
                                        required={fieldToRender.required}
                                        readOnly
                                        value={Number(weekCounter) || 1}
                                        max={4}
                                        autoFocus={false} 
                                        defaultValue={Number(weekCounter)}
                                    />
                                    {
                                        category === "image" ?
                                        <button 
                                            type="button" 
                                            className={`icon ${(weekCounter >= 4 || loaderState === "loading") ? 'disabled' : ''}`}
                                            onClick={() => {
                                                increment(fieldToRender.name)
                                                handleDataLayerGA4({
                                                    field_name: fieldToRender.label,
                                                    event: "prompt_interaction", 
                                                    field_selection:weekCounter,
                                                    field_type:"Optional",
                                                })
                                            }}
                                            disabled={weekCounter >= 4}
                                        >+</button> :
                                        <button 
                                            type="button" 
                                            className={`icon ${(loaderState === "loading") ? 'disabled' : ''}`}
                                            onClick={() => {
                                                increment(fieldToRender.name)
                                                handleDataLayerGA4({
                                                    field_name: fieldToRender.label,
                                                    event: "prompt_interaction", 
                                                    field_selection:weekCounter,
                                                    field_type:"Optional",
                                                })
                                            }}
                                        >+</button>
                                    }
                                </div>
                            </div>
                        </div>
                        :<></>
                        }
                        </React.Fragment>
                    )
                })
            } 
        </div>
        <div className={'btn-wrap'}>
            <button
                className={`btnDefault btn-default ${(generateDisable) &&'disabled'}`}
                onClick={handleSubmit}
            >
                <i className='icon-art'></i>&nbsp;
                GENERATE CONTENT
            </button>
        </div>
    </div>
  );
};

export default CpInputContent;
