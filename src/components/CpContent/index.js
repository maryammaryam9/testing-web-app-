import React from "react";
import '../CpContent/CpContent.scss';
const CpContent = ({ imageSrc, altText, title, description, bgColor, imgWidth }) => {

    return (
        <>
            <div className={`cp-content`}>
                <div className="content-detail">
                    <div className={`img-wrap ${imgWidth}`}>
                        <img src={imageSrc} alt={altText} />
                    </div>
                    <div className={`detail-wrap`}>
                        <h3 className={`title`}>{title}</h3>
                        <p className={`description`}>{description}</p>
                    </div>
                </div>
            </div>
            {/* <div className={`cp-content grey-bg`}>
                <div className={`content-detail`}>
                    <div className={`img-wrap`}>
                        <img src={contentcard1} alt="Contet Pending" />
                    </div>
                    <div className={`detail-wrap`}>
                        <h3 className={`title grey-title`}>Content Pending</h3>
                        <p className={`description grey-description`}>Just waiting for your spark to ignite the magic!</p>
                    </div>
                </div>
            </div> */}

            {/* LOADING… */}
            {/* <div className={`cp-content`}>
                <div className={`content-detail`}>
                    <div className={`img-wrap mw-20`}>
                        <img src={contentcard2} alt="Loading" />
                    </div>
                    <div className={`detail-wrap`}>
                        <h3 className={`title`}>LOADING…</h3>
                        <p className={`description`}>because good things take a byte!</p>
                    </div>
                </div>
            </div> */}

            {/* WHOA THERE! */}
            {/* <div className={`cp-content`}>
                <div className={`content-detail`}>
                    <div className={`img-wrap mw-32`}>
                        <img src={contentcard3} alt="Whoa There" />
                    </div>
                    <div className={`detail-wrap`}>
                        <h3 className={`title`}>WHOA THERE!</h3>
                        <p className={`description`}>This request is a bit too saucy for AI!</p>
                    </div>
                </div>
            </div> */}

        </>
    );
};
export default CpContent;