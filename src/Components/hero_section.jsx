import React from "react";
import "./hero_section.css";

const Hero = () => {
  return (
    <section className="hero-section d-flex align-items-center ">
      {/*======================================= 
                     left side
       ====================================== */}
      <div className="hero-text-side d-flex flex-column gap-4 align-items-start">
        <span className="hero-mini-tag">
          Advanced cloud infrastructure solutions{" "}
        </span>
        <h1 className="hero-main-title">
          Global server power with{" "}
          <span className="highlight-text">fully Arab management </span>
        </h1>
        <p className="hero-sub-text">
          Give your project the stability it deserves.A comprehensive platform
          for selling and renting cloud servers (VPS), shared hosting, and
          domains with the highest processing speeds and strongest security.
        </p>
        <div className="hero-action-buttons d-flex gap-4">
          <a
            href="/servers"
            className="primary-hero-btn btn text-white d-flex gap-2 align-items-center"
          >
            <i className="fa-solid fa-arrow-right"></i> host your server now
          </a>
          <a
            href="/contact"
            className="secondary-hero-btn btn d-flex gap-2 align-items-center"
          >
            <i className="fa-solid fa-headset"></i> Talk to our experts
          </a>
        </div>
      </div>

      {/*================================================== 
                           right side
       =================================================== */}
      <div className="hero-visual-side">
        {/*===============1- servers================== */}
        <svg viewBox="0 0 500 450" className="hostinger-servers-svg">
          {/*========interface of servers======= */}
          <linearGradient id="serverBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          {/*========= the small server======== */}
          <g className="back-server">
            <path
              d="M60,190 L120,160 L170,185 L110,215 Z"
              fill="#4c1d95"
              opacity="0.7"
            />
            <path
              d="M60,190 L110,215 L110,300 L60,275 Z"
              fill="url(#serverBody)"
            />
            <path d="M110,215 L170,185 L170,270 L110,300 Z" fill="#131034" />
            {/* the leds of small one */}
            <line
              x1="70"
              y1="210"
              x2="100"
              y2="225"
              stroke="#a855f7"
              strokeWidth="3"
            />
            <line
              x1="70"
              y1="230"
              x2="100"
              y2="245"
              stroke="#06b6d4"
              strokeWidth="3"
            />
            <line
              x1="70"
              y1="250"
              x2="100"
              y2="265"
              stroke="#a855f7"
              strokeWidth="3"
            />
          </g>
          {/*=========the large server========= */}
          <g className="main-server-rack">
            {/* upper side */}
            <path d="M140,120 L240,70 L330,110 L230,160 Z" fill="#6d28d9" />
            {/* border of front side*/}
            <path
              d="M140,120 L230,160 L230,330 L140,290 Z"
              fill="url(#serverBody)"
              stroke="#a855f7"
              strokeWidth="1"
            />
            {/* right side */}
            <path d="M230,160 L330,110 L330,280 L230,330 Z" fill="#090522" />
            {/* the leds of large one */}
            <g className="led-slots">
              {/*  1 */}
              <rect
                x="155"
                y="155"
                width="60"
                height="12"
                rx="3"
                fill="#1e1b4b"
                transform="skewY(22)"
              />
              <circle
                cx="165"
                cy="225"
                r="3"
                fill="#22d3ee"
                className="blink-fast"
              />
              <rect
                x="175"
                y="159"
                width="35"
                height="4"
                rx="2"
                fill="#c084fc"
                transform="skewY(22)"
              />
              {/*  2 */}
              <rect
                x="155"
                y="185"
                width="60"
                height="12"
                rx="3"
                fill="#1e1b4b"
                transform="skewY(22)"
              />
              <circle
                cx="165"
                cy="255"
                r="3"
                fill="#a855f7"
                className="blink-slow"
              />
              <rect
                x="175"
                y="189"
                width="35"
                height="4"
                rx="2"
                fill="#22d3ee"
                transform="skewY(22)"
              />
              {/*  3 */}
              <rect
                x="155"
                y="215"
                width="60"
                height="12"
                rx="3"
                fill="#1e1b4b"
                transform="skewY(22)"
              />
              <circle
                cx="165"
                cy="285"
                r="3"
                fill="#22d3ee"
                className="blink-fast"
              />
              <rect
                x="175"
                y="219"
                width="35"
                height="4"
                rx="2"
                fill="#c084fc"
                transform="skewY(22)"
              />
            </g>
          </g>
        </svg>

        {/*===============2- floating card one ================== */}
        <div className="floating-card spec-card d-flex align-items-center gap-2 position-absolute p-2">
          <i className="fa-solid fa-hard-drive cloud-icon"></i>
          <span className="cloud-text">NVMe SSD Storage</span>
        </div>

        {/*===============-3 floating card two ================== */}
        <div className="floating-card speed-card  d-flex align-items-center gap-2 position-absolute p-2">
          <i className="fa-solid fa-shield-halved cloud-icon"></i>
          <span className="cloud-text">DDoS Protection</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
