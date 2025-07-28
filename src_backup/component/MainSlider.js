import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import "../css/MainSlider.css"; 
import ba1 from "../img/banner01.png";
import ba2 from "../img/banner02.png";
import ba3 from "../img/banner03.png";

const MainSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="main-slider">
      <Slider {...settings}>
        <div>
          <img src={ba1} alt="슬라이드1" className="slider-img" />
        </div>
        <div>
          <img src={ba2} alt="슬라이드2" className="slider-img" />
        </div>
        <div>
          <img src={ba3} alt="슬라이드3" className="slider-img" />
        </div>
      </Slider>
    </div>
  );
};

export default MainSlider;
