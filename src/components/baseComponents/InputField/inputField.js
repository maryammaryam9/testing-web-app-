import React, { useState } from "react";
import useFormValidation from "../../hooks/useFormValidation";

/** 
  id: any;
  name: string;
  value: any;
  //Optional
  placeholder?: string;
  label?: string;
  type?: string;
  events?: any;
  classes?: any;
  errorValidateMsg?: string;
**/

const InputField = ({ ...props }) => {
  const [inputValue, setInputValue] = useState("");
  
  const { onChange, ...restEvents } = props.events;
  const { contClass = '', fieldClass, errorClass=''} = props.classes;
  const {labelText = '', labelClassName =''} = props.labeloptions;
  const { handleValidation, values, errors } = useFormValidation();


  const handleChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (typeof onChange === "function" && onChange) {
        handleValidation(event);
        onChange(newValue,errors);
    };
  };

  const fieldProps = {
    ...restEvents,
    ...props,
    className: fieldClass,
    autoComplete:"off",
    onChange: handleChange,
  };

  return (
    contClass!== '' ?
    <div className={contClass ? contClass : ""}>
        {
            labelClassName !== '' && labelText !== '' &&
            <label className={labelClassName} htmlFor={props.name}>{labelText}</label>
        }
    <input {...fieldProps} />
    {errors[props.name] && errorClass !=='' && (
        <span className={errorClass}>
        <span className={`icon-error`}></span>
        {errors[props.name]}
        </span>
    )}
    </div> : (
        <>
        {
            labelClassName !== '' && labelText !== '' &&
            <label className={labelClassName} htmlFor={props.name}>{labelText}</label>

        }
            <input {...fieldProps} />
            {errors[props.name] && errorClass !== '' &&(
            <span className={errorClass}>
                <span className={`icon-error`}></span>
                {errors[props.name]}
            </span>
            )}
        </>)
  );
};

export default InputField;