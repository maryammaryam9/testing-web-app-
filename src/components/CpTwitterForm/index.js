import React, { useEffect, useState } from 'react';
import '../CpTwitterForm/CpForm.scss';
import config from '../../utils/config';
import { OPTION_DATA } from '../../api/apis/apiUrls/apiUrls';
import { postData } from '../../api/apis/twitterPost';

const CpTwitterForm = ({ setState, setPostResponse }) => {
    const [description, setDescription] = useState('');
    const [text, setText] = useState('');
    const [textPlaceholder, setTextPlaceholder] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [moodData, setMood] = useState([]);
    const [selectedMood, setSelectedMood] = useState('');
    const [toneOfVoiceData, setToneOfVoiceData] = useState([]);
    const [selectedTone, setSelectedTone] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(config.authUrl + OPTION_DATA);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();

                const postDescription = data['Social Media'].Options[0].Description || '';
                setDescription(postDescription);

                const topicData = data['Social Media'].Options[0].Fields.find(option => option.name === 'postTopicText').placeholder || '';
                setTextPlaceholder(topicData);

                const targetAudienceData = data['Social Media'].Options[0].Fields.find(option => option.name === 'postTargetAudience').placeholder || '';
                setTargetAudience(targetAudienceData);

                const moodOptions = data['Social Media'].Options[0].Fields.find(option => option.name === 'postMoodSelector').options || [];
                setMood(moodOptions);

                const toneVoiceOptions = data['Social Media'].Options[0].Fields.find(option => option.name === 'postToneSelector').options || [];
                setToneOfVoiceData(toneVoiceOptions);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (event) => setText(event.target.value);
    const handleMoodChange = (event) => setSelectedMood(event.target.value);
    const handleRadioChange = (event) => setSelectedTone(event.target.value);
    const handleAudienceChange = (event) => setTargetAudience(event.target.value);

    const validateForm = () => {
        const errors = {};

        if (!text.trim()) {
            errors.text = true; // Use a boolean instead of message
        }

        if (!selectedMood) {
            errors.mood = true;
        }

        setValidationErrors(errors);

        // Return true if no errors
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {

        if (validateForm()) {

            setState("loading");
            const body = {
                postTopicText: text,
                postMoodSelector: selectedMood,
                postToneSelector: selectedTone,
                postTargetAudience: targetAudience,
                postHashtags: "",
            };

            try {
                const response = await postData(body);
                setPostResponse(response);
                setState("loaded");

            } catch (error) {
                setState("failed");

                console.error("Failed to submit data:", error);
            }
        };
    };

    return (
        <div className='CpForm'>
            <div className='card-header'>
                <h3 className='title'>X.com Post</h3>
                <a href='#' className='newPost-link'><i className='icon-edit_square'></i> New Post</a>
            </div>
            <p className='form-desc'>{description}</p>
            <div className={`bs-form`}>
                <div className={`form-group mb-0 ${validationErrors.text ? 'typ-error' : ''}`}>
                    <label className='form-label'>Topic <span className='text-danger'>*</span></label>
                    <textarea
                        className='form-control'
                        placeholder={textPlaceholder}
                        onChange={handleChange}
                        maxLength={500}
                        value={text}
                    ></textarea>
                </div>
                <p className='character-count'>
                    <span className='count'>{text.length}</span>/500 Characters
                </p>
                <div className={`form-group ${validationErrors.mood ? 'typ-error' : ''}`}>
                    <label className='form-label'>Mood <span className='text-danger'>*</span></label>
                    <select
                        className="form-control"
                        name="postMoodSelector"
                        value={selectedMood}
                        onChange={handleMoodChange}
                        required
                    >
                        <option value="">Select a mood</option>
                        <option value="Happy">Happy</option>

                        {/* {moodData.map((mood, index) => (
                            <option key={index} value={mood}>{mood}</option>
                        ))} */}
                    </select>
                </div>
                <div className='optional-fields'>
                    <h3>OPTIONAL FIELDS</h3>
                </div>
                <label className='radio-group-label'>Tone of Voice</label>
                <ul className='radio-group'>
                    {toneOfVoiceData.map((tone, index) => (
                        <li key={index}>
                            <input
                                type="radio"
                                className='radio-btn'
                                id={tone}
                                name="toneOfVoice"
                                value={tone}
                                onChange={handleRadioChange}
                                checked={selectedTone === tone}
                            />
                            <label htmlFor={tone}>{tone}</label>
                        </li>
                    ))}
                </ul>
                <div className={`form-group ${validationErrors.audience ? 'typ-error' : ''}`}>
                    <label className={`form-label`} htmlFor="targetAudience">Target Audience</label>
                    <input
                        type="text"
                        name="targetAudience"
                        className={`form-control`}
                        placeholder={targetAudience}
                        id="Target Audience"
                        onChange={handleAudienceChange}
                        autoComplete="false"
                        required
                    />
                </div>
            </div>
            <div className={'btn-wrap'}>
                <button
                    className={`btnDefault btn-default`}
                    onClick={handleSubmit}
                >
                    <i className='icon-art'></i>&nbsp;
                    GENERATE CONTENT
                </button>
            </div>
        </div>
    );
};

export default CpTwitterForm;
