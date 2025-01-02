import { useEffect, useState } from "react";

function useFormValidation() {
  //Form values
  const [values, setValues] = useState({});
  //Errors
  const [errors, setErrors] = useState({});

  //A method to handle form inputs
  const handleValidation = (
    event,
  ) => {
    //To stop default events
    event.persist();
    let name = event.target.name;
    let val = event.target.value;
    validate(event, name, val);
    //set these values in state
    // setValues({
    //   ...values,
    //   [name]: val,
    // });
    setValues((prevState) => {
      return {...prevState, [name]: val}
    });
  };

  useEffect(() => {
    if(Object.keys(errors).length < 0){
      setErrors({});
    } else {
      setErrors((prevState) => prevState);
    }
  },[errors]);
  
  console.log(Object.keys(errors).length, errors, values, "error hook")
  const validate = (
    event,
    name,
    value
  ) => {
    switch (name) {
      case "firstName": {
        //Name validation
        const nameRegex = /^[A-Za-z]+[A-Za-z ]*$/;
        let tempErrorSet = errors;
        if (!value) {
          tempErrorSet = {
            ...tempErrorSet,
            firstName: "Name is required",
          };
        } else if (!value.match(nameRegex)) {
          tempErrorSet = {
            ...errors,
            firstName: "Please enter valid Name",
          };
        } else {
          delete tempErrorSet.firstName;
        }
        setErrors(tempErrorSet);
        break;
      }
      case "lastName": {
        //Name validation
        const nameRegex = /^[A-Za-z]+[A-Za-z ]*$/;
        let tempErrorSet = errors;
        if (!value) {
          tempErrorSet = {
            ...tempErrorSet,
            lastName: "Last Name is required",
          };
        } else if (!value.match(nameRegex)) {
          tempErrorSet = {
            ...tempErrorSet,
            lastName: "Please enter valid Last Name",
          };
        } else {
          delete tempErrorSet.lastName;
        }
        setErrors(tempErrorSet);
        break;
      }
      case "email": {
        // email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          setErrors((prevState) => {
            return {...prevState, email: "Email is required"}
          });
        } else if (!value.match(emailRegex)) {
          setErrors((prevState) => {
            return {...prevState, email: "Please enter valid Email Id"}
          });
        } else {
          setErrors(prevState => {
            const {email, ...rest} = prevState
            return rest
        });
        }
        break;
      }
      case "otp": {
        // otp validation
        const otpRegex = /^[0-9]{6}$/;
        if (!value) {
          setErrors((prevState) => {
            return {...prevState, otp: "OTP is required",}
          });
        } else if (!value.match(otpRegex)) {
          setErrors((prevState) => {
            return {...prevState, otp: "Please enter valid OTP"}
          });
        } else {
          setErrors(prevState => {
            const {otp, ...rest} = prevState
            return rest
        });
        }
        break;
      } 
      default : {
        break;
      }       
    }
  };

  return {
    values,
    errors,
    handleValidation,
  };
}

export default useFormValidation;