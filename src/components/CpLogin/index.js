import React, { useState, useEffect , useRef  } from 'react';
import '../CpLogin/cpLogin.scss';
import logoImg from '../../assets/images/Sophius-logo.svg';
import holdImg from '../../assets/images/wait-list-icon.svg';
import successImg from '../../assets/images/success-icon.svg';
import mobileimg from '../../assets/images/mobileDisplay.png';
import { useNavigate } from 'react-router';
import { getOTP, postAllowedUser, userExistCheck, userLogin, userOTPVerification } from "../../api/apis/auth";
import { useDispatch } from 'react-redux';
import { isLoggedIn, userData } from "../../utils/store/reducers/UserSlice";
import useGA4DataLayer from '../hooks/useGA4DataLayer';
import { homePageConstant } from '../../utils/constants';
import InputField from '../baseComponents/InputField/inputField';
import Timer from '../baseComponents/Timer/timer';
import CryptoJS from "crypto-js"; // Importing crypto-js for hashing
import { useHistory } from "react-router-dom";
import { useLocation  } from 'react-router-dom';
const CpLogin = ({
    triggerToast
}) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [otpVisible, setOtpVisible] = useState(false);
    const [isUserNew, setUserNew] = useState(false);
    const [activeTab, setActiveTab] = useState('tnc'); // State to manage active tab (default to 'tnc')
    const [formErrors, setFormErrors] = useState({});
    const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
    const [resendOtpClickCounter, setResendOtpClickCounter] = useState(0);
    const [isBirlaMail, setBirlaMail] = useState(false); // Check for @birla.com email domain
    const [step, setStep] = useState(1); // State to manage which step to display (1 or 2)

    //   this is testing  find path

    const [source, setSource] = useState("");

    useEffect(() => {
      // Get the query parameter from the URL
      const queryParams = new URLSearchParams(window.location.search);
       console.log(  queryParams, ' this is previous path ');
      const sourceQuery = queryParams.get("source");
      console.log(  sourceQuery, ' this is previous path ')
      if (sourceQuery) {
        setSource(`You came from: ${sourceQuery}`);
      } else {
        setSource("No referrer detected.");
      }
    }, []);





    // const location = useLocation();
    // const previousPath = location.state?.from || "No previous path"; // Access passed state


    
    // DataLayer start
    const datalayerGA4 = useGA4DataLayer();
    // datalayerGA4.setAllData    This is a method provided by useGA4DataLayer to push or set data into the global GA4 data layer.
    const handleDataLayerGA4 = () => {
        datalayerGA4.setAllData({
            event: "login_submission",
            pagetype: "Login",
            click_text: "Continue",
            hashed_email_id: CryptoJS.SHA256(email).toString(CryptoJS.enc.Hex)
        });
    };
    // DataLayer end

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleEmailChange = (value, errors) => {
        
        setEmail(value);
        if (errors.email === undefined || Object.keys(errors).length === 0) {
            setFormErrors(prevState => {
                const { email, ...rest } = prevState
                return rest;
            });
        } else {
            setFormErrors((prevState) => {
                let tempObj = { ...prevState, ...errors }
                return tempObj;
            });
        }
    };


    const handleOtpChange = (value, errors) => {
        setOtp(value);
        if (errors.otp === undefined || Object.keys(errors).length === 0 || value.length === 6) {
            setFormErrors(prevState => {
                const { otp, ...rest } = prevState
                return rest;
            });
        } else {
            setFormErrors((prevState) => {
                let tempObj = { ...prevState, ...errors }
                return tempObj;
            });
        }
    };

    // GET OTP CTA click functionality Start
    const getOtpApiCall = async () => {
        if (email !== '') {
            try {
                let requestBody = JSON.stringify({
                    email: email
                });
                let response = await getOTP(requestBody);
                 console.log(response, ' this is res ')
                if (!response?.data?.error_code && response?.data?.message && response?.data?.isAllowed) {
                    setOtpVisible(true); // Show OTP section after clicking 'Get OTP'
                } else if (!response?.data?.error_code && !response?.data?.isAllowed) {
                    setBirlaMail(true); // Show OTP section after clicking 'Get OTP'
                } else {
                    triggerToast("error", response.data.message);
                };
            } catch (error) {
                triggerToast("error", "Some error occurred. Try again!");
            }
        }
    };
    const handleGetOtp = () => {
        console.log('clicked Otp')
        getOtpApiCall();
    };
    // GET OTP CTA click functionality end

    const checkUserExist = async () => {
        try {
            let requestBody = JSON.stringify({
                email: email
            });
            let response = await userExistCheck(requestBody);
            if (!response?.error && response?.data?.exists === true) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            triggerToast("error", "Some error occurred. Try again!");
        }
    };

    const checkValidOtp = async () => {
        try {
            let requestBody = JSON.stringify({
                email: email,
                otp: parseInt(otp, 10)
            });
            let response = await userOTPVerification(requestBody);
            if (!response?.data?.error && response?.data?.message) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            triggerToast("error", "Some error occurred. Try again!");
        }
    };
    const loginUser = async () => {
        let formData = JSON.stringify({
            email: email,
            otp: Number(otp)
        });


         console.log( formData, 'this is user login  ');

        let loginResponse = await userLogin(formData);
        console.log( loginResponse, 'this is user login  loginResponse ');

        if (!loginResponse?.data?.error && loginResponse?.data?.access_token) {
            localStorage.setItem("access_token", loginResponse?.data?.access_token);
            localStorage.setItem("refresh_token", loginResponse?.data?.refresh_token);
            dispatch(isLoggedIn(true));
            localStorage.setItem("isLoggedIn", true);
            let { user_id } = loginResponse?.data;
            let user = {
                email: email,
                id: user_id,
            };
            dispatch(userData(user));
            localStorage.setItem("userInfo", JSON.stringify(user));
            triggerToast("success", "Logged in successfully!");
            setTimeout(() => {
                navigate("/")
            }, 1000);
        } else {
            triggerToast("error", "Unable to login with credentials!");
        }
    };
    const handleSubmit = async () => {



         console.log('i am  handel submit btn ')

        handleDataLayerGA4();

        // setLoading(true);
        try {
            // let otpValidated = checkValidOtp(); // API call to check if user entered OTP is valid
            let otpValidated = true; // API call to check if user entered OTP is valid
            if (otpValidated) {
                let isExistingUser = await checkUserExist(); // Check if already exist or is new user and accordingly redirect
                if (isExistingUser) {
                    setUserNew(false);
                    loginUser();
                } else {
                    setUserNew(true);
                }
                //   setLoading(false); 
            } else {
                triggerToast("error", otpValidated.data.message);
            }
        } catch (error) {
            triggerToast("error", "Some error occurred. Try again!");
        }
    };

    // Resend CTA click functionality Start
    const handleResetTimer = function () {
        let resendCount = resendOtpClickCounter;
        // clear last OTP
        if (otp !== null || otp !== '') {
            setOtp('');
        }
        setResendOtpClickCounter(resendCount++);
        setResendButtonDisabled(true);
        // resend OTP Api call
        getOtpApiCall();
    };
    // Resend CTA click functionality end

    // Privacy Popup code if user is Signing up for first time start
    const handleTermsChange = (e) => {
        setTermsAccepted(e.target.checked);
    };

    // Handle tab click to set active tab and scroll to the corresponding section
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        // Scroll to the section with the corresponding id
        const targetSection = document.getElementById(tab);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleSignUP = () => {
        triggerToast("success", "Logged in successfully!");
        setTimeout(() => {
            navigate("/");
        }, 1000);
        loginUser();
    }
    // Privacy Popup code if user is Signing up for first time start


    // waiting list API call
    // useEffect(() => {
    //       const fetchConfigData = async () => {
    //         try {
    //           const result = await postAllowedUser();
    //           const response = result.data;
    //           setBirlaMail(response);
              
    //         } catch (error) {
    //           console.error("Error fetching config data:", error);
    //         }
    //       };
      
    //       fetchConfigData();
    //   }, []);

    const handleSaveMySpotClick = async() => {
        let requestBody = JSON.stringify({
            email: email
        });
        const response =await postAllowedUser(requestBody);
        setStep(2); // Switch to step 2 after button click
    };

    return (
        <>


{/* <p>{source}</p> */}
{/* 
<div>
      <h1>Login Page</h1>
      <p>{previousPath}</p>
      
    </div> */}



      
            <div className={`bs-sec typ-login cm-desktop`}>
                <div className={'cp-login'}>
                    <div className={`bs-form`}>
                        <div className={'form-section'}>
                            <div className={'logo-wrap'}>
                                <img src={logoImg} alt="logo" />
                            </div>
                            {
                               !isBirlaMail &&  
                                <h2 className={'title'}>Login <span className={'or'}>or</span> Signup</h2>
                            }
                            {
                                step !== 2 &&
                                <div className={`form-group ${(formErrors['email']!== undefined && Object.keys('email').length !== 0) ? 'typ-error' : ''}`}>
                                    {/* <label className={`form-label`} htmlFor="email">Email</label>
                                    <input
                                        type="text"
                                        name="email"
                                        value={email}
                                        className={`form-control`}
                                        onChange={handleEmailChange}
                                        placeholder="Enter your email"
                                        id="email"
                                        required 
                                    /> */}
                                    <InputField
                                        type="text"
                                        classes={{
                                            fieldClass: "form-control",
                                        }}
                                        className="form-control"
                                        placeholder="Enter your email"
                                        id="email"
                                        name="email"
                                        autoComplete="false"
                                        value={email}
                                        events={{
                                            onChange: (value, errors) => {
                                                handleEmailChange(value, errors)
                                            }
                                        }}
                                        labeloptions={{
                                            labelText: "Email",
                                            labelClassName: "form-label"
                                        }}
                                        // onKeyUp={(e) => {
                                        //     if (e.key === "Enter") {
                                        //         handleGetOtp()
                                        //     }
                                        // }}
                                        onKeyDown={(e) => {
                                            if (e.key === " ") {
                                                e.preventDefault();
                                              }
                                        }}
                                    />
                                    {
                                        !isBirlaMail &&
                                        <button
                                            className={`btn-link`}
                                            onClick={handleGetOtp}
                                            disabled={email === '' || formErrors.email || otpVisible}
                                        >
                                            Get OTP
                                        </button>
                                    }
                                </div>
                            }
                            <div className={'otp-visible-wrap'}>
                                {otpVisible && (
                                    <>
                                        <div className={`form-group typ-otp ${formErrors['otp'] ? 'typ-error' : ''}`}>
                                            {/* <label className={`form-label`} htmlFor="otp">OTP</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={handleOtpChange}
                                            placeholder="Enter OTP received on your email"
                                            className={`form-control`}
                                            maxLength={6}
                                            id='otp' 
                                        /> */}

                                            <InputField
                                                type="text"
                                                maxLength={6}
                                                classes={{
                                                    fieldClass: "form-control",
                                                }}
                                                className="form-control"
                                                placeholder="Enter OTP received on your email"
                                                id="otp"
                                                name="otp"
                                                autoComplete="false"
                                                value={otp}
                                                events={{
                                                    onChange: (value, errors) => {
                                                        handleOtpChange(value, errors)
                                                    }
                                                }}
                                                labeloptions={{
                                                    labelText: "OTP",
                                                    labelClassName: "form-label"
                                                }}
                                            // onKeyUp={(e)=>{
                                            //     if(e.key==="Enter"){
                                            //         handleSubmit()
                                            //     }}}
                                            />
                                            <button
                                                className={`btn-link`}
                                                onClick={handleResetTimer}
                                                disabled={resendButtonDisabled || resendOtpClickCounter > 3}
                                            >
                                                Resend
                                            </button>
                                            {
                                                <div className='timer-wrap'>
                                                    {
                                                        resendButtonDisabled ?
                                                            <Timer
                                                                initialMinute={homePageConstant.RESEND_OTP_TIME_LIMIT_MINUTE}
                                                                handleStartTimerCTA={(value) => setResendButtonDisabled(value)}
                                                            /> :
                                                            <span className='timer'></span>
                                                    }
                                                </div>
                                            }
                                        </div>
                                    </>
                                )}
                                {
                                    !isBirlaMail &&
                                    <div className={'btn-wrap'}>
                                        <button
                                            className={`btnDefault btn-default`}
                                            onClick={handleSubmit}
                                            disabled={!(Object.keys(formErrors).length === 0 && email !== '' && otp !== '')}
                                        >
                                            CONTINUE
                                        </button>
                                    </div>
                                }
                            </div>
                            {isBirlaMail && (
                                <div className={`wait-list-wrap ${step!== 2 && "typ-step2"}`}>
                                    {step === 1 && (
                                        <div className={'step-1'}>
                                            <div className='img-wrap'>
                                                <img src={holdImg} alt="waitlist-step-1" />
                                            </div>
                                            <div className={'content-wrap'}>
                                                <h3 className='title'>Hold up!</h3>
                                                <p className='desc'>We're in Beta mode and only open to a select few. All are welcome in February 2025! <span className='cm-bold cm-line-break'>Join the waitlist!</span></p>
                                                <div className={'btn-wrap'}>
                                                    <button className={`btnDefault btn-default`} onClick={handleSaveMySpotClick}>
                                                        SAVE MY SPOT
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {step === 2 && (
                                        <div className={`step-2`}>
                                            <div className='img-wrap'>
                                                <img src={successImg} alt="waitlist-step-2" />
                                            </div>
                                            <div className={'content-wrap'}>
                                                <h3 className='title'>Thanks for showing interest!</h3>
                                                <p className='desc'>We'll email you when our doors open.</p>                                        
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isUserNew &&
                    <div className={`cp-login typ-tnc`}>
                        <div className={`bs-form`}>
                            <div className={'terms-Section'}>
                                <ul className={'tab-list'}>
                                    <li
                                        className={`tab-item ${activeTab === 'tnc' ? 'active' : ''}`}
                                        onClick={() => handleTabClick('tnc')}
                                    >
                                        <a href='#tnc' className={'tab-link'} data-id="tnc">Terms of Use</a>
                                    </li>
                                    <li
                                        className={`tab-item ${activeTab === 'policy' ? 'active' : ''}`}
                                        onClick={() => handleTabClick('policy')}
                                    >
                                        <a href='#policy' className={'tab-link'} data-id="policy">Privacy Policy</a>
                                    </li>
                                </ul>
                                <div className={'tab-content'}>
                                    <div className='tab-desc' id='tnc'>
                                        <h2 className={'tab-tilte'}>Terms of Use</h2>
                                        <h3 className='sub-title'>1. Acceptance of Terms</h3>
                                        <ol className='dec-list typ1'>
                                            <li>These Terms of Use (the "Terms") provided below are with respect to the access and use of the sophius.officeofananyabirla.com website (the "Website") and/or any services provided therein which may be accessed via, but not restricted to, the World Wide Web and these Terms shall apply whenever you access the Website, on whatever device(s).</li>
                                            <li>The Website is a service of Talk and Cheese Private Limited, having its registered office at Level - 17 Birla Aurora, Dr. Annie Besant Road, Worli, Mumbai 400030, Maharashtra, India (the “Company" / “company”). The company provides its service to you subject to the Terms as contained herein. </li>
                                            <li>These Terms govern use of the Website and/or any services provided therein. By accessing and/or using the Website and/or any services provided therein in any manner whatsoever, you agree to accept these Terms in full and be legally bound by the same. If you disagree with these Terms or any part of these Terms, you shall not use and/or access the Website and/or any services provided therein or any part thereof.</li>
                                            <li>You acknowledge and understand that the Company may require you to register and provide certain information to it as a condition of using or accessing certain services, features, functions and content and you undertake to provide all the said particulars truthfully and to the best of your knowledge and information.  </li>
                                            <li>The Company may change and/or amend these Terms from time to time. As and when such changes and/or amendments are made, the changed and/or amended Terms (the “Amended Terms”) shall be made available for you to view through <u><em>[sophius.officeofananyabirla.com].</em></u> </li>
                                            <li>You agree that if you use or continue to use the Website and/or any services provided therein on and/ or after the date on which the Amended Terms are notified on the Website, the Company shall be entitled to presume your use as acceptance of such Amended Terms.</li>
                                        </ol>

                                        <h3 className='sub-title'>2. Registration and access</h3>
                                        <ol className='dec-list typ2'>
                                            <li>You must be at least 18 years of age to use the Website and/or any services provided therein. By using the Website and by agreeing to the Terms, you warrant and represent that you are at least 18 years of age and are competent to contract under the laws of India and in case of any misrepresentations and/or false assertions on this ground, you shall be solely responsible for any dispute or claim arising out of or in connection with such misrepresentation and/or false assertion whatsoever and further hereby irrevocably agree to defend and/or settle any third party lawsuit or proceeding brought against the Company, its subsidiaries, its directors, officers, employees, agents, advertisers, licensors, suppliers, based upon such false claims, assertions and misrepresentations. </li>
                                            <li>Some features of our website may require you to create a user account. To register, you may be required to provide certain information and/or details, for the accuracy and/or completeness of which you agree to be solely liable. The Company will not be liable for any losses caused by any unauthorized use of your account.</li>
                                            <li>Any reference to the expression “Website” in these Terms shall also include a reference to the services provided by the Company, its directors, its subsidiaries, officers, employees, agents, advertisers, licensors, and suppliers through these Terms as defined herein below.</li>
                                            <li>Unless repugnant to the context thereof, any reference to the expression “Company” / “company” shall include its directors, its subsidiaries, officers, employees, agents, advertisers, licensors, and suppliers.</li>
                                        </ol>

                                        <h3 className='sub-title'>3. Services</h3>
                                        <ol className='dec-list'>
                                            <li>Indicative: "Services" shall mean the suite of products, tools, applications, and features provided by Company, including but not limited to:

                                                <ul className='bulltes'>
                                                    <li><p className='desc'>Access and Use of AI Tools:</p>
                                                        <p className='desc'> (a) Generative AI models, APIs, and associated tools for text generation, image creation, speech synthesis, and other outputs based on user inputs;</p>

                                                        <p className='desc'>(b) Customizable AI capabilities tailored to specific end-uses or user requirements.</p>
                                                    </li>
                                                    <li><p className='desc'>Support and Integration Services:</p>
                                                        <p className='desc'>(a) Integration of AI models with third-party applications, platforms, or systems;</p>
                                                        <p className='desc'>(b) Technical support, maintenance, and updates provided by the Company.</p>
                                                    </li>
                                                    <li>
                                                        <p className='desc'>	Hosting and Platform Access:</p>
                                                        <p className='desc'>(a) Cloud-based access to the AI services and underlying infrastructure;</p>
                                                        <p className='desc'>(b) Any portals, dashboards, or interfaces enabling user interaction with the Services.</p>
                                                    </li>
                                                    <li>
                                                        <p className='desc'>Data Processing and Management:</p>
                                                        <p className='desc'>(a) Collection, processing, and analysis of user inputs, feedback, and related data for the purpose of improving or delivering the Services;</p>
                                                        <p className='desc'>(b) Secure storage and handling of data, subject to the Company’s privacy policy.</p>
                                                    </li>
                                                    <li>
                                                        <p className='desc'>Educational and Community Resources:</p>
                                                        <p className='desc'>(a) Documentation, tutorials, developer resources, and other educational content provided to users;</p>
                                                        <p className='desc'>(b) Access to forums, communities, or other collaborative spaces managed by the Company.</p>
                                                    </li>
                                                    <li>
                                                        <p className='desc'>Limitations and Exclusions:</p>
                                                        <p className='desc'>The Services do not include any deliverables, outputs, or functionalities or those that violate applicable laws, policies, or third-party rights.</p>
                                                    </li>
                                                </ul>
                                            </li>

                                            <li></li>



                                        </ol>

                                        <h3 className='sub-title'>4. Content</h3>
                                        <ol className='dec-list typ4'>
                                            <li>For the purposes of these Terms, “Content” shall include any data, prompts, material, or information provided by you to the Services as input, including but not limited to text, graphics, images, documents, PDFs, and/or without limitation any other file formats (“Input”), and any data, material, or information generated, transformed, adapted, or returned by the Services in response to such Input, including but not limited to text, graphics, images, documents, PDFs, and/or without limitation any other file formats (“Output”). The Input and Output, collectively referred to as “Content,” comprise of all forms of data processed or generated through the Services, including through the use of our APIs.</li>
                                            <li>Ownership of Content: As between you and the Company, and to the extent permitted by applicable laws, you (a) retain your ownership rights in Input and (b) own the Output. We hereby assign to you all our rights, title, and interest, if any, in and to Output.</li>
                                            <li>Third-Party Output: Due to the probabilistic nature of artificial intelligence, the Output generated for your Input may not be unique, and similar or identical Output may be generated for other users. In furtherance, our assignment above does not extend to other users’ output or any third party output.</li>
                                            <li>Use of Content: The Company may process and use Content for the following purpose -
                                                <ul className='lower-alpha'>
                                                    <li>	Providing, maintaining (including storing, whether incidental, transient or permanent), improving, and developing the Services;</li>
                                                    <li>	Ensuring compliance with laws and regulations;</li>
                                                    <li>	Enforcing these Terms, including investigating potential violations; and</li>
                                                    <li>	Enhancing the safety and reliability of the Services.</li>
                                                </ul>

                                            </li>
                                        </ol>

                                        <h3 className='sub-title'>5. Licence to use Website  </h3>
                                        <ol className='dec-list typ5'>
                                            <li>Subject to your acceptance of these Terms, the Company grants you a non-exclusive, non-transferable limited license to use the Website and/or its Services in strict accordance with the terms and conditions in these Terms and as permitted via instructions on the Website. </li>
                                            <li>Except as may be explicitly permitted through this site, you agree not to save, download, cut and paste, sell, license, rent, lease, modify, distribute, copy, reproduce, transmit, publicly display, publicly perform, publish, adapt, edit, or create derivative works from materials, code or content on or from the Website. Systematic retrieval of data or other content from the Website to create or compile, directly or indirectly, a collection, compilation, database or directory without written permission from the Company is prohibited. In addition, use of the content or materials for any purpose not expressly permitted under these Terms is prohibited.</li>
                                        </ol>

                                        <h3 className='sub-title'>6. Intellectual property rights/ Data protection</h3>
                                        <ol className='dec-list typ6'>
                                            <li>	The Website contains material, trade names and marks and other proprietary and/or confidential information, including, but not limited to, various data, text, software, photos, graphics, video, music and sound, documents, PDFs, and other media or files, which may either be owned by the Company or any other third party/parties and may be a subject matter of protection under the applicable laws.</li>
                                            <li>	 The Company shall retain ownership of all rights and title over the Services, API, SDK, API Keys, documentation, software, technology and all other aspects of the Company’s offerings, including without limitation, any improvements, modifications or adaptations irrespective of whether such right is registered or not in accordance with the applicable laws.</li>
                                            <li>	Subject to clause 4, nothing on the Website shall be construed as conferring any license/right to reproduce the contents therein whether owned by the Company or any third party and the violation of the same may result in initiation of legal action by the owner/ proprietor/ holder of the said rights.</li>
                                        </ol>

                                        <h3 className='sub-title'>7.	User Content and Conduct:</h3>
                                        <ol className='dec-list typ7'>
                                            <li> You agree that you shall not comment, share, display, upload, modify, publish, transmit, update or share any information on the Website that:
                                                <ul className='lower-alpha'>
                                                    <li>	 belongs to another person and to which you do not have any right; </li>
                                                    <li>	 is grossly harmful, harassing, blasphemous, defamatory, obscene, pornographic, pedophilic, libelous, invasive of another's privacy, hateful, or racially, ethnically objectionable, disparaging, relating or encouraging money laundering or gambling, or otherwise unlawful in any manner whatever;</li>
                                                    <li>	 seeks to harm or exploit minors in any way;</li>
                                                    <li> infringes any patent, trademark, trade secret, copyright or other proprietary rights;</li>
                                                    <li> violates any law for the time being in force;</li>
                                                    <li>	deceives or misleads the addressee about the origin of such messages or communicates any information which is grossly offensive or menacing in nature;</li>
                                                    <li>	 impersonate another person;</li>
                                                    <li>	 contains software viruses or any other computer code, files or programs designed to interrupt, destroy or limit the functionality of any computer resource;</li>
                                                    <li>	 threatens the unity, integrity, defence, security or sovereignty of India, friendly relations with foreign states, or public order or causes incitement to the commission of any cognisable offence or prevents investigation of any offence or is insulting any other nation. </li>
                                                </ul>
                                            </li>
                                            <li>You further agree that you shall not:
                                                <ul className='lower-alpha'>
                                                    <li>	Reproduce, copy, modify, sell, store, distribute or otherwise exploit the Website for any commercial purposes, or any component thereof (including, but not limited to any data, materials or information accessible through the Website).</li>
                                                    <li>	Use any device and/or software to interfere or attempt to interfere with the proper working of the Website and/or take any action that imposes an unreasonable or disproportionately large load on the Website infrastructure.</li>
                                                </ul>
                                            </li>
                                            <li>
                                                You further agree to indemnify and hold harmless, without objection, the Company, its subsidiaries, its directors, officers, employees, agents, advertisers, licensors, suppliers, and partners against all and any claims, actions and/or demands and/or liabilities and/or losses and/or damages whatsoever arising from or resulting from or in any way related to such actions and/or conduct as stated under this clause, or otherwise by your use and/or access of the Website and the Services provided therein.
                                            </li>
                                            <li>7.4.	By the use of any Content with respect to the Service, you waive all moral rights in the Content and you expressly grant, and you represent and warrant that you have a right to grant, to the Company, a royalty-free, sublicensable, transferable, perpetual, irrevocable, non-exclusive, worldwide license to use, reproduce, modify, publish, list information, edit, translate, distribute, publicly perform, publicly display, and make derivative works of all such Content and/or likeness as contained in your Content, in whole or in part, and in any form, media or technology, whether now known or hereafter developed, for use in connection with the Service.</li>
                                            <li>You agree and understand that the terms and conditions of provision of Services appearing herein or at any other place on the Website, whether provided by the Company or a third party service provider, may be non-exhaustive, incomplete, suggestive and/or abridged, and are subject to revision, addition, modification and/or change, without prior notice, at the Company’s or respective third party service provider’s discretion, as the case may be.</li>
                                        </ol>
                                        <h3 className='sub-title'>8.	Indemnification</h3>
                                        <ol className='dec-list typ8'>
                                            <li>	You agree to indemnify and hold harmless, without any limitation, the Company, its subsidiaries, its directors, officers, employees, agents, advertisers, licensors, suppliers, and partners from and against any claims, actions and/or demands and/or liabilities and/or losses and/or damages whatsoever arising from or resulting from or in any way related to your use and/or inability to use the Services or services offered by third parties through the Website, your use of the Content in any manner whatsoever, violation of the Terms or any other actions connected with the use of Services or services offered by third parties through the Website, including any liability or expense arising from all claims, losses, damages (actual and consequential), suits, judgments, litigation costs and attorneys' fees, of every kind and nature, whether direct or indirect, either during the period that you are accessing the Website and/or any of its Services or services offered by third parties through the Website, and even after termination of the same in respect of any claims, actions and/or demands and/or liabilities and/or losses and/or damages whatsoever which have arisen at any time during such period that you accessed the Website and/or any of its Services or services offered by third parties through the Website.</li>
                                            <li>	Further, you agree to indemnify the Company its subsidiaries, its directors, officers, employees, agents, advertisers, licensors, suppliers, and partners in respect of any claim of ownership or any other claims associated with any artistic works, labels, audio, pictures, cinematograph films, videos, logos, brands, trademarks and/or any other intellectual property, with respect to the Content uploaded, generated, created and/or used by you in any other manner whatsoever in violation of third-party rights with respect to the same.</li>

                                        </ol>

                                        <h3 className='sub-title'>9.	Disclaimer of Warranties</h3>
                                        <ol className='dec-list typ9'>
                                            <li>Except for the express warranties stated herein, the Website as well as any other Services as provided by the Company under these Terms are provided on an "as is"  and “as available” basis, and the Company disclaims any and all other warranties, conditions, or representations (express, implied, oral or written), relating to the Website and/or such Services or any part thereof, including, without limitation, any and all implied warranties of quality, security, reliability, performance, usability, accessibility, accuracy of content or fitness for a particular purpose. The Company further expressly disclaims any warranty or representation to any third party whatsoever.</li>
                                            <li>It is solely your responsibility to evaluate the accuracy, completeness and usefulness of all opinions, advice, services, and other information provided through the Website. </li>
                                            <li>	While the Company strives to ensure the accuracy and completeness of the descriptions, content, and terms & conditions presented on the Website, you acknowledge and agree that the Company shall not be held liable for any discrepancies, errors, or omissions resulting from human or data entry mistakes, or otherwise by virtue of the nature of Artificial Intelligence and related technology. Further, the Company shall not be liable for any loss, damage, or harm incurred by any user due to inaccuracies in the information provided by such user(s). The Company expressly disclaims any liability for any loss, damage, or harm caused by such inaccuracies, errors, or changes in the Content.</li>
                                            <li>	The Company does not warrant that the access to the Website will be uninterrupted, delay-free or error-free or that defects in the Website will be corrected, although every reasonable effort shall be made to keep the Website up and running at all times. </li>
                                            <li>	In case there is any loss of information and/or Content, caused due to any reason, whether as a result of any disruption of service, suspension and/or termination of the Service, the Company shall not be liable in any way for the same. </li>
                                            <li>The Company does not guarantee the accuracy, truthfulness and veracity of any statement, offer, comment, claim, averment, contention etc. made on the Website or in the Company’s correspondence with you. You further understand and agree that there are inherent risks associated with using services listed on the Website, including but not limited to, the nature of Artificial Intelligence and related technologies, as well as reliance on third-party service providers. You irrevocably agree that the Company shall not be held liable for any claims, damages, losses, or liabilities arising out of or in connection with your use of the Services provided by the Company, and/or any end service providers. </li>
                                            <li>	The Company will not be liable for any loss or damage caused by, including but not limited to, a distributed denial-of-service attack, viruses or other technologically harmful material that may infect your computer equipment, computer programs, data or other proprietary material due to your use of the Website or to your downloading of any material posted on it, or on any website linked to it, though the Company shall make all efforts to ensure the proper functioning of the Website at all times. </li>
                                            <li>	The Website is controlled and operated from India by the Company and the Company makes no representation that the material, content and/or services provided by the Company under these Terms are appropriate or will be available for use in other parts of the world. If you access the Website from outside India, you hereby agree to be entirely responsible for compliance with all applicable local laws as well as International Conventions and Treaties in this regard.</li>

                                        </ol>

                                        <h3 className='sub-title'>10.	Limitation of Liability</h3>
                                        <ol className='dec-list typ10'>
                                            <li>In no event and under no circumstances will the Company be liable for any damages whatsoever, including but not limited to direct, indirect, incidental, punitive or consequential, arising out of the use and/or access to or inability to use and/or access to the Website and/or any Services being provided by the Company under these Terms, even if the Company has been advised of the possibility of such damages.</li>
                                            <li>Notwithstanding anything else contained herein, it is hereby expressly agreed that the maximum liability of the Company arising under any circumstances, in respect of any Services offered through the Website and/or by access/use of the Website otherwise, shall be limited to the sum of INR 10,000/-. You absolutely and irrevocably agree to waive/ give up all other claims/rights arising in your favour under any applicable law(s) for the time being in force with respect to any consequential harm, loss and/or damage suffered by you as a result of your access and/or use of the Website or the Services provided thereunder.</li>

                                        </ol>

                                        <h3 className='sub-title'>11.	Termination</h3>
                                        <ol className='dec-list typ11'>
                                            <li>	The Company may terminate your account and/or the Services offered by the Company with immediate effect, without prior notice to you and without assigning any reason(s) whatsoever and remove all and any Content and/or material and/or information that you may have uploaded and/or submitted to the Website.
                                                <ul className='lower-alpha'>
                                                    <li>	If in the opinion of the Company, you have breached any of the terms and conditions of the Terms and/or, </li>
                                                    <li>	 If in the opinion of the Company and/or any law enforcement agency, regulatory authority, or in pursuance of an order, decree etc. of a court of law, it is not in the public interest and/or is illegal or has subsequently become illegal to continue providing such services to you for any reason whatsoever, and/or</li>
                                                    <li> For any other reason that the Company may deem fit. </li>
                                                </ul>
                                            </li>

                                        </ol>

                                        <h3 className='sub-title'>12.	Links and Advertisements</h3>
                                        <ol className='dec-list typ12'>
                                            <li>The Website may provide, or third parties may provide, links to other World Wide Web sites or resources. Further, the Website may display or rely on certain data supplied to it by various third parties. The Company may have no control over such data, websites and resources and you acknowledge and agree that the Company is not responsible for the availability (and/or non-availability) of such external sites or resources, and/or the accuracy of such displayed data, and does not endorse and is not responsible or liable for any inaccuracy/discrepancy and any consequent loss/damage resulting from such data, content, advertising, products, or other materials on or available from such third parties, sites or resources.</li>
                                            <li>You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such site or resource.</li>
                                        </ol>

                                        <h3 className='sub-title'>13. Jurisdiction, Governing Law and Dispute Resolution</h3>
                                        <ol className='dec-list typ13'>
                                            <li>These Terms and any dispute or claim arising out of or in connection with it or its subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of India.</li>
                                            <li>Notwithstanding anything to the contrary contained herein, all disputes pertaining to your use of (or inability to use) the Website and / or Services thereon, shall be resolved by arbitration, administered by Presolv360, an independent institution, in accordance with its Dispute Resolution Rules (“Rules”). You agree that the arbitration shall be before a sole arbitrator appointed under the Rules. The juridical seat of arbitration shall be New Delhi, India. The language of arbitration shall be English. The law governing the arbitration proceedings shall be Indian law. The decision of the arbitrator shall be final and binding on the parties. Subject to the above, the competent courts at the seat shall have exclusive jurisdiction. The parties agree to carry out the arbitration proceedings virtually through the online dispute resolution (“ODR”) platform of Presolv360  (https://presolv360.com/) and, for such purpose, the email addresses and / or mobile numbers available, provided or otherwise referenced shall be considered. Each party shall be responsible for intimating such institution in the event of any change in its email address and / or mobile number throughout the arbitration proceedings. In the event the arbitration proceedings cannot be administered virtually in the opinion of the arbitrator, the proceedings shall be conducted physically, and the venue of the proceedings shall be as determined by the arbitrator having regard to the circumstances of the case, including the convenience of the parties.</li>
                                        </ol>
                                        <h3 className='sub-title'>14.	Entire agreement</h3>
                                        <ol className='dec-list typ14'>
                                            <li>	These Terms (along with our privacy policy), constitute the entire agreement between you and us in relation to your use of the Website and/or its Services, and supersedes any and all previous agreements in respect of your use of this the Website and/or its Services.</li>
                                            <li>	Supplementary agreements, terms and conditions, if any, shall apply depending on your use of the Website, its Services and choices/selections/inputs given by you while using the same, and your continued use of the Website and/or its Services shall be treated as your consent to such supplementary agreements, terms and conditions as well. </li>
                                        </ol>

                                        <h3 className='sub-title'>15.	Waiver and Severability of Terms </h3>
                                        <ol className='dec-list typ15'>
                                            <li>The failure of the Company under any circumstances to exercise or enforce any right or provision of the Terms shall not constitute a waiver of such rights or provision.</li>
                                            <li>In the event that any of the stipulations and conditions or any portion thereof of these Terms is held by a court/ tribunal of competent jurisdiction to be invalid, it is expressly understood and agreed that such condition or portion thereof shall be automatically considered deleted/ replaced/ modified to embrace the order of the said court/tribunal and the same shall not impair the enforceability of the remaining provisions of these Terms.</li>
                                        </ol>

                                        <h3 className='sub-title'>16.	User Credentials </h3>
                                        <ol className='dec-list typ16'>
                                            <li>	You agree to take all such measures as may be necessary to protect the secrecy of your user identification and/or password, and further agree to not reveal the same to any other person(s).</li>
                                            <li>	You agree to use only your own user identification and/or password to access the Website, its Services or any part thereof.</li>
                                            <li>	You further agree and acknowledge that you acquire no rights to any account and/or the user identification and/or any codes assigned to you by the Company. </li>
                                            <li>	You agree that except as otherwise proved herein, the Company reserves the right to change and/or re-assign the same at its sole discretion without being liable to you for any kind of damages and/or relief and/or any other consequence(s). </li>
                                            <li>	In the event of theft and/or loss of user identification and/or password and/or security word, you shall notify the Company immediately by e-mail and concurrently provide the Company with a written notice sent by Registered Post to that effect. You agree to remain liable for use of the Services by any third party until such theft or loss is notified to the Company. </li>
                                        </ol>

                                        <h3 className='sub-title'>17.	Privacy and User Data </h3>
                                        <ol className='dec-list typ17'>
                                            <li>	The Company at the time of registration and/or during your access to the Website and/or any of its Services or at any other time collect data from you (“User Data”). Such User Data is collected, stored, handled and transmitted as per the Privacy Policy of the Website as available on [sophius.officeofananyabirla.com], which is hereby incorporated into these terms and conditions by this reference.</li>
                                            <li>	By agreeing to these Terms, you also hereby expressly agree to the Privacy Policy of the Website as available on <u>[sophius.officeofananyabirla.com].</u></li>
                                        </ol>

                                        <h3 className='sub-title'>18.	Grievance Officer</h3>
                                        <ol className='dec-list typ18'>
                                            <li>Kindly address all your grievances regarding use of the Website to sophius@officeofananyabirla.com The Company shall make all efforts to address your grievance within a period of one (1) month from the date of receipt of such grievance, in a manner compliant with law.</li>
                                        </ol>

                                        <h3 className='sub-title'>19.	Changes to Terms of Use</h3>
                                        <ol className='dec-list typ19'>
                                            <li> The Company reserves the exclusive right, at its sole discretion, to amend, modify, or update Terms of Use herein at any time without prior notice. Any such amendments, modifications, or updates shall take immediate effect upon publication on the Company’s official website. Users are advised to periodically review the Terms of Use to remain informed of any changes.</li>
                                        </ol>
                                    </div>
                                    <div className='tab-desc' id='policy'>
                                    <h2 className={'tab-tilte'} >Privacy Policy</h2>
                                    <p className={'desc'}>At Talk and Cheese Private Limited, we are committed to protecting and respecting your privacy. This Privacy Policy explains how Talk and Cheese Private Limited handles personal information. </p>
                                        <p className={'desc'}>This Privacy Policy describes the types of personal information we obtain from or about users of our services (“data subjects”), how we may use the personal information, with whom we may share such personal information, and the choices available to the data subjects with respect to the use of their personal information. This Privacy Policy also describes the measures we take to safeguard personal information and how data subjects can contact us to exercise their choices and to learn more about our privacy practices.</p>
                                        <p className={'desc'}>Occasionally, our services may link to a different privacy policy, including privacy policies of third parties, that will outline the particular privacy practices applicable to a particular service. We may change this Privacy Policy from time to time so please check this page occasionally to ensure that you agree to any changes.  If you, on behalf of yourself or another data subject, continue to use our services after we change the Privacy Policy, such changes will apply to all information we obtain from or about you and such other data subjects.</p>
                                        <p className={'desc'}>Effective Date: December 13, 2024</p>
                                        <p className={'desc'}>Last Updated: December 13, 2024</p>
                                        <h3 className='sub-title'>I. PERSONAL INFORMATION WE COLLECT</h3>
                                        <p className={'desc'}>We collect information that identifies, relates to, describes, is reasonably capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular data subject, household or device (“Personal Information” or “personal information”). For the purpose of this privacy policy, sensitive personal data or information of a person ("SPDI") is defined under the Information Technology Act 2000 ("IT Act") and the Information Technology (Reasonable security practices and procedures and sensitive personal data or information) Rules 2011 ("SPDI Rules"). Please note that usage of the term Personal Information in this Privacy Policy includes Sensitive Personal Data or Information, wherever appropriate and/or mandated under the IT Act and the SPDI Rules .</p>
                                        <p className={'desc'}>We will only collect personal information about a data subject if it is provided to us voluntarily by the data subject, directly, or by a user claiming to act on behalf of such data subject or is collected by us to provide services requested by or on behalf of a data subject. When you provide us personal information, you agree that the personal information is one of the following: </p>
                                        <ul className={'policyList'}>
                                            <li>Your personal information.</li>
                                            <li>Personal information of a person who has granted you specific authorization to disclose their personal information to us.</li>
                                        </ul>
                                        <p className={'desc'}>Personal Information that we collect may be stored and processed in India or any other country in which we or our service providers maintain facilities. By using our services, you consent to any such storage, processing, and transfer of information outside India. The categories of personal information we may collect, directly or indirectly, include the following:</p>
                                        <ol className={'policyList'}>
                                            <li>Personal contact information, such as name, gender, email address, postal address, telephone number.</li>
                                            <li>Identifiers and login information as may be required for the Company’s services, such as your username and password, and/or a security token.</li>
                                            <li>Information that we receive from your device including your IP address, MAC address, your service provider, your device, browser details, operating system, hardware model, time zone setting, device location, etc.</li>
                                            <li>Content (as defined under the Terms of Use available at [sophius.officeofananyabirla.com] )</li>
                                            <li>Users' interactions with our API, including but not limited to API content, request metadata, response time, error logs, and other technical information essential for the functioning, optimization, and troubleshooting of the API</li>
                                            <li>Patterns of user interaction, including time spent using the Services, navigation trends, session tracking, and user preferences</li>
                                            <li>Users' opt-in preferences for receiving promotional communications, marketing materials, surveys, newsletters, or other forms of informational content, and consent to such communications</li>
                                            <li>Information obtained through linked accounts or interactions with third-party platforms, such as social media handles and publicly available profile data</li>
                                            <li>Any feedback, reviews, and/or any other form of user-generated content shared by you</li>
                                            <li>Data regarding how you were referred to our services, including referral codes, promotional sources, or any other tracking mechanisms that indicate the origin of user acquisition</li>
                                        </ol>
                                        <p className={'desc'}>This list is not exhaustive and may vary depending on the services we provide.</p>
                                        <h3 className='sub-title'>II.	SOURCES OF PERSONAL INFORMATION</h3>
                                        <p className={'desc'}>We obtain personal information about data subjects when the data subject, or a person acting on their behalf, registers for or use our services. When you visit, use, or navigate our services, we may process personal information depending on how you interact with us and the services, the choices you make, and the products and features you use, however, processing of such information is strictly limited to purposes that are legitimate and proportionate, including but not limited to, enhancing functionality and user experience, improving operational performance, and safeguarding the security and integrity of our systems, and for providing our services.</p>
                                        <h3 className='sub-title'>III.	HOW WE MAY USE THE PERSONAL INFORMATION WE OBTAIN</h3>
                                        <p className={'desc'}>We may use the personal information we obtain for the following purposes:</p>
                                        <ul className={'policyList'}>
                                            <li>To provide you with services that you request.</li>
                                            <li>To provide analyze, and maintain our services, for example to respond to your questions.</li>
                                            <li>To operate, administer, support, personalize, and develop our services.</li> 
                                            <li>To create, maintain, customize, and secure accounts with us.</li>
                                            <li>To facilitate and manage the registration of device with our services.</li>
                                            <li>To authenticate device and use of our services.</li>
                                            <li>To communicate and send information about our services and events, for example about changes or improvements to the services.</li>
                                            <li>For legitimate business purposes.</li>
                                            <li>To seek views or comments on the services we provide.</li>
                                            <li>To comply with applicable laws, court orders, orders of competent law enforcement agencies and/or regulators, or governmental regulations and to enforce applicable legal requirements and policies, including this Privacy Policy, and our Terms of Use.</li>
                                            <li>To provide data subjects with support and to respond to inquiries, including to investigate and address concerns and monitor and improve our responses.</li>
                                            <li>To help maintain the safety, security, and integrity of our website, application, products and services, databases and other technology assets, and business.</li>
                                            <li>To send communications to users of our service that may be of interest to such users.</li>
                                            <li>To operate, evaluate and improve our business (including developing new services; analyzing our services; managing our communications; and performing accounting, auditing and other internal functions) and.</li>
                                            <li>To perform product development, testing and data analyses (including market and consumer research).</li>
                                            <li>For any other legitimate and reasonable purpose in connection with our business operations.</li>
                                        </ul>
                                        <p className={'desc'}>We also may use the personal information in other ways with express written consent, such as when a data subject chooses to use a service or participate in a program we may offer.</p>
                                        <p className={'desc'}>In addition, by collecting personal information through cookies, tracking tools and other automated means, we learn how to best tailor our services to our users. We may use cookies to customize visits to our website and deliver content consistent with our users’ interests. We may use IP addresses to help diagnose problems with our server and to administer our website and/or services. We also may use IP addresses to help identify users of our website and/or services for the duration of a session and to gather statistical information about our users. We may use analytics to determine how much time users spend on our website, how users navigate through the website, and how we may tailor our website and services to better meet the needs of our users.</p>
                                        <p className={'desc'}>We may also use the personal information we obtain about data subjects in other ways for which we provide specific notice at the time of collection.</p>
                                        <h3 className='sub-title'>IV.	INFORMATION WE SHARE</h3>
                                        <p className={'desc'}>As a matter of policy, we do not sell or rent personal information of data subjects. We do not share any personal information with third parties for their own direct marketing purposes. Further, we do not share or otherwise disclose such personal information, except as described in this Privacy Policy.</p>
                                        <p className={'desc'}>We may disclose personal information for the purposes described in Article III of this Privacy Policy. In addition, we may disclose the personal information to other third parties with express consent by or on behalf of a data subject, such as when the data subject chooses to use a service or participate in a program that we may offer jointly with another entity. When information we collect is aggregated, anonymized or otherwise does not identify a data subject, we may use that information for any purpose or share it with third parties, to the extent permitted by applicable law.</p>
                                        <p className={'descSubHead'}>A. DISCLOSURES TO AFFILIATES AND SERVICE PROVIDERS FOR BUSINESS PURPOSE</p>
                                        <p className={'desc'}>We may share personal information of data subjects with our affiliates primarily for business and operational purposes. We may share personal information with third-party service providers engaged to perform services on our behalf, including but not limited to, providers of data analytics, cloud computing infrastructure, and operational support. We impose appropriate contractual obligations on such service providers to ensure that personal information is used solely for the purpose of performing the services for which they are engaged or as required to comply with applicable legal requirements. We require these service providers to appropriately safeguard the privacy and security of the data subjects’ personal information they collect, use, disclose or otherwise process on our behalf.</p>
                                        <p className={'descSubHead'}>B. DISCLOSURES FOR OTHER PURPOSES</p>
                                        <p className={'desc'}>Due to the existing regulatory environment, we cannot ensure that all of the private communications and other Personal Data will never be disclosed in ways not otherwise described in this Privacy Policy. By way of example (without limiting the foregoing), we may be required to disclose personal data if we are required to do so (1) by law, regulation or pursuant to legal process (such as a court order or subpoena); (2) in response to requests by government agencies, such as law enforcement authorities, embassies, consulates and other regulatory authorities; (3) to establish, exercise or defend our legal rights; (4) when we believe disclosure is necessary or appropriate to prevent physical or other harm or financial loss; (5) in connection with an investigation of suspected or actual illegal activity, to address fraud, security or technical issues or to respond to emergencies; or (6) otherwise with consent or at the direction of, or on behalf of, the affected data subject.</p>
                                        <p className={'desc'}>We may transfer personal information we have about a data subject in the event we sell or transfer all or a portion of our business or assets, as permitted or required by law. Should such a transfer occur, we will use commercially reasonable efforts to direct the transferee to use the personal information in a manner that is consistent with this Privacy Policy.</p>
                                        <p className={'desc'}>We also may share the personal information we obtain about data subjects in other ways for which we provide specific notice at the time of collection.</p>
                                        <h3 className='sub-title'>V. YOUR CHOICES</h3>
                                        <p className={'desc'}>We offer certain choices in connection with the personal information we maintain about data subjects. At any time, you, the data subject, or your authorized agent or the authorized agent of the data subject (the “requestor”) may submit to us a verifiable request not to use your or the data subject’s personal information, or to refrain from sharing the personal information with third parties, or to access, erase, or amend such personal information we maintain about you or the data subject.</p>
                                        <p className={'desc'}>To help safeguard privacy and maintain security, we will take reasonable steps to verify the requestor’s identity before granting access to or deleting the data subject’s personal information. The requestor is not required to have an account with us to make a verifiable request. The requestor must be able to verify their identity with us and provide us with their authority to act on behalf of you or the data subject, as the case may be.</p>
                                        <p className={'desc'}>To make these requests, please contact us as indicated in the “How to Contact Us” section of this Privacy Policy. If we deny a request, we will notify the requestor of the reasons for the denial. You control the personal information that you provide to us. If you choose not to provide us or let us use certain personal information, you may not be able to take advantage of some of the services we offer.</p>
                                        <h3 className='sub-title'>VI.	HOW WE PROTECT PERSONAL INFORMATION</h3>
                                        <p className={'desc'}>We maintain reasonable administrative, technical and physical safeguards designed to protect personal information against accidental, unlawful or unauthorized loss, alteration, access, disclosure or use. However, no electronic data transmission or storage of information can be guaranteed to be 100% secure. It is pertinent to note that we cannot ensure or warrant the security of any information you transmit to us, and you use our services and provide us with your information at your own risk.</p>
                                        <h3 className='sub-title'>VII.	RETENTION OF PERSONAL INFORMATION</h3>
                                        <p className={'desc'}>When you terminate your registration with us, information associated with your account is automatically deleted from our database, subject to certain exceptions. By contacting us as specified in the “How to Contact Us” section of this Privacy Policy, you or your authorized agent may, at any time, may request that we remove from our databases any personal information we maintain about you or a data subject on whose behalf you are acting, and we will honor such request upon verification, subject to certain exceptions and exemptions. We cannot respond to a request or provide personal information if we are not able to verify the identity or authority of the requestor to make the request or confirm the personal information relates to the data subject to whom the request pertains.</p>
                                        <p className={'desc'}>We may retain certain personal information so we can comply with the request and notify our service providers to do the same. Unless prohibited by applicable law, we may also retain personal information for archival or record-keeping purpose as required by law or our internal policies and operations.</p>
                                        <h3 className='sub-title'>VIII. CHILDREN’S PERSONAL INFORMATION</h3>
                                        <p className={'desc'}>We recognize the importance of protecting children’s online privacy. Our services are intended for adult audience and is not directed to children who are minors. To the extent you disclose to us any personal information about a minor child, you agree that you have the authority to do so as a parent or legal guardian and you authorize us to use and disclose such personal information in accordance with this privacy policy. We do not knowingly collect, use or disclose personal information from any minor child without the parent or guardian’s consent. We request that you notify us immediately if you become aware that we have unknowingly collected personal information from a minor child, and we will make reasonable efforts to delete such information from our records.</p>
                                        <h3 className='sub-title'>IX.	UPDATES TO OUR PRIVACY POLICY</h3>
                                        <p className={'desc'}>This Privacy Policy may be updated periodically to reflect new services or changes in our personal information privacy and security practices.</p>
                                        <h3 className='sub-title'>X.	HOW TO CONTACT US</h3>
                                        <p className={'desc'}>To ask us questions about this Privacy Policy, or to submit a request to access, delete or amend personal information of a data subject, please contact us at one of the following methods:</p>
                                        <ul className={'policyList'}>
                                            <li>Email us at sophius@officeofananyabirla.com</li>
                                            <li>Write to us at:<br/>
                                                Talk and Cheese Private Limited<br />
                                                Attention: [sophius@officeofananyabirla.com]; +91 22-61109770<br/>
                                                Floor 17, Birla Aurora, Century Bazaar, Prabhadevi, Mumbai, Maharashtra 400025
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className={'btn-wrap'}>
                                    <div className="cp-checkbox">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            className={`form-control`}
                                            checked={termsAccepted}
                                            onChange={handleTermsChange}
                                        />
                                        <label htmlFor="terms" className={`form-label`}>I agree to the Terms and Conditions</label>
                                    </div>
                                    <button
                                        className={`btn btn-default disabled`}
                                        onClick={handleSignUP}
                                        disabled={!termsAccepted}
                                    >
                                        SIGNUP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
            <div className={'cm-mobile'}>
                <img src={mobileimg} alt='mobile image'></img>
            </div>
        </>

    );
};

export default CpLogin;




