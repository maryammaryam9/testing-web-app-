import React, { useState } from "react";
import { staticLoginBackgroundImages } from "../../assets/images/images";
import CpLogin from "../../components/CpLogin";
import CpToaster from "../../components/CpToaster";
import BsModel from "../../components/BsModel";
import CpLoginSwiper from "../../components/CpLoginSwiper";
import CpLoginHeader from "../../components/CpLoginHeader";

const Login = () => {
  const [toastType, setToastType] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const newLoginBackgroundImages = [
    staticLoginBackgroundImages.loginBackgroundImages,
    // staticLoginBackgroundImages.loginBackgroundImages1,
    // staticLoginBackgroundImages.loginBackgroundImages2,
    // staticLoginBackgroundImages.loginBackgroundImages3,
    // staticLoginBackgroundImages.loginBackgroundImages4,
    // staticLoginBackgroundImages.loginBackgroundImages5,
    // require('../../assets/images/bitcoin.png')
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(Math.floor(Math.random() * newLoginBackgroundImages.length))
  

  const triggerToast = (type, message) => {
    if (!toastMessage) {
      setToastType(type);
      setToastMessage(message);
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }
  };
  // commenting the code as confirm the back screen will not change on refresh
    // const getRandomImage = () => {
    //   const randomImage = Math.floor(Math.random() * newLoginBackgroundImages.length);
    //   setCurrentImageIndex(randomImage);
    // }

    // useEffect(() => 
    //   setInterval (() => {
    //     getRandomImage();
    //   },[3000]),
    // []);         

  return (
    <div className="new-login-container">
      <div className="login-image">
        <img alt="loginBackgroundImages" className='login-img' src={newLoginBackgroundImages[currentImageIndex]} />
      </div>
      <CpLoginHeader/> 
      <CpLogin
        triggerToast={triggerToast}
      />
      <CpLoginSwiper />
      {toastMessage !== "" && (
        <CpToaster
          toastType={toastType}
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

export default Login;
