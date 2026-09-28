import React from "react";
import "./location_section.css";
import Syria_image from "../Assets/syria.png";

const SyriaSection = () => {
  return (
    <section className="location-section d-flex  align-items-center gap-5">
      <div className=" content-side">
        <h2>
          Speed ​​and stability are the <span>foundation of our services</span>
        </h2>
        <p className="section-desc">
          We rely on a modern hosting infrastructure and advanced data centers
          designed to provide strong performance and lasting stability for
          websites and online stores.
        </p>
        <p className="section-sub-desc">
          We offer reliable solutions with ongoing technical support to ensure
          the best possible operating experience for our clients inside and
          outside Syria, with direct and fast connectivity to all governorates.
        </p>

        <div className="connection-badge">
          <i className="fa-solid fa-bolt-lightning"></i>
          <span>
            Ultra-fast response time (Low Ping) within the Syrian network
          </span>
        </div>
      </div>

      {/* الجهة اليسرى: الخريطة المعدلة جغرافياً وهندسياً وبدقة عالية */}
      <div className=" text-center ">
        <div className="map-container-wrapper">
          <img src={Syria_image} alt="syria map" className="syria-image" />

          <svg viewBox="0 0 500 400" className="interactive-svg-layer">
            {/* 🔴 نقطة حلب: مستقرة بوضوح داخل حدود الشمال الغربي */}
            <g className="city-location aleppo">
              <circle cx="140" cy="90" r="14" className="city-pulse" />
              <circle cx="140" cy="90" r="6" className="city-dot" />
              <text x="155" y="95" className="city-text">
                Aleppo
              </text>
            </g>

            {/* 🔴 نقطة اللاذقية المصلحة: النقطة في موقعها الساحلي الصحيح تماماً، والنص مرفوع للأعلى لتوضيح القراءة 🌟 */}
            <g className="city-location latakia">
              <circle cx="50" cy="145" r="14" className="city-pulse" />
              <circle cx="50" cy="145" r="6" className="city-dot" />
              <text x="50" y="125" className="city-text">
                Latakia
              </text>
            </g>

            {/* 🔴 نقطة دمشق: مستقرة وممتازة في موقعها الصحيح */}
            <g className="city-location dmascus">
              <circle cx="115" cy="325" r="14" className="city-pulse" />
              <circle cx="115" cy="325" r="6" className="city-dot" />
              <text x="130" y="330" className="city-text">
                Damascus
              </text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default SyriaSection;
