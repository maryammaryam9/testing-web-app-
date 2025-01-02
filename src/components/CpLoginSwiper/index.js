import React from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';
import '../CpLoginSwiper/CpLoginSwiper.scss';

const CpLoginSwiper = () => {
  const slides = [
    {
      title: "",
      desc: "Discover anything you need - start searching globally now"
    },
    {
      title: "",
      desc: "Boost productivity and elevate your content creation"
    },
    {
      title: "",
      desc: "Leverage the power of AI for your business."
    },
    {
      title: "",
      desc: "Transform ideas into visual reality - in seconds."
    }
  ];

  return (
    <div className="cp-login-swiper cm-desktop">
      <Swiper
        slidesPerView={1}
        direction="vertical"
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          type: "bullets", 
          renderBullet: (index, className) => {
            const formattedNumber = index < 9 ? `0${index + 1}` : `${index + 1}`;
            return `<span class="${className}">${formattedNumber}</span>`;
          },
        }}
        modules={[Pagination, Autoplay, EffectFade]}
        className="bs-swiper typ-login"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="swiper-card">
              {
                slide.title !== "" && 
                <h2 className="title">{slide.title}</h2>
              }
              {
                slide.desc !== "" &&
                <p className="desc">{slide.desc}</p>
              }
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CpLoginSwiper;
