import { React, useState } from 'react';
// import "../CpContentPending.scss"
import contentpending from "../../assets/images/content-pending.png"
import contentLoading from "../../assets/images/loading.gif"
import contentFailed from "../../assets/images/contentcard-3.png"
import CpContent from '../CpContent';
import CpGeneratedPost from './CpGeneratedPost';

const CpContentPending = ({ state, postResponse }) => {

    return (
        // <div>
        //     <img src={contentpending} alt='' />

        //     <h2 className='title'>CONTENT PENDING</h2>
        //     <p>Just waiting for your spark to ignite the magic!</p>
        // </div>

        <>
            {state === "pending" ? (
                <CpContent
                    imageSrc={contentpending}
                    altText="Content Pending"
                    title="CONTENT PENDING"
                    description="Just waiting for your spark to ignite the magic!"
                    bgColor="grey-bg"
                    imgWidth="typ-pending"
                />
            ) : state === "loading" ? (
                <CpContent
                    imageSrc={contentLoading}
                    altText="Loading"
                    title="Loading"
                    description="Because good things take a byte!"
                    bgColor="white-bg"
                    imgWidth="typ-loading"
                />
            ) : state === "loaded" ? (
                <CpGeneratedPost postDescription={postResponse.Message} />

                // <CpContent
                //     imageSrc={contentLoading}
                //     altText="Content Loaded"
                //     title="CONTENT LOADED"
                //     description={postResponse.Message}
                //     bgColor="green-bg"
                //     imgWidth="typ-loaded"
                // />
            ): state === "failed" ? (
                <CpContent
                    imageSrc={contentFailed}
                    altText="WHOA THERE!"
                    title="WHOA THERE!"
                    description="This request is a bit too saucy for AI! "
                    bgColor="white-bg"
                    imgWidth="typ-loaded mw-32"
                />
            ): null}

        </>

    );
}

export default CpContentPending;
