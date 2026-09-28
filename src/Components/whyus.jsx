import React from 'react';
import './whyus.css';

const WhyUs = () => {

  const features = [
    {
      icon: "fa-solid fa-bolt-lightning",
      title: "Unmatched Performance",
      desc: "Powered by the latest AMD EPYC processors and enterprise NVMe SSD storage to guarantee maximum processing speeds for your critical data."
    },
    {
      icon: "fa-solid fa-shield-halved",
      title: "Advanced Security",
      desc: "All servers are equipped with real-time automated DDoS protection and continuous automated backup systems to safeguard your infrastructure."
    },
    {
      icon: "fa-solid fa-headset",
      title: "24/7 Expert Support",
      desc: "Our dedicated team of network engineers and systems specialists is available around the clock to assist you via live chat and technical tickets."
    },
    {
      icon: "fa-solid fa-terminal",
      title: "Full Root Access",
      desc: "Get absolute control over your server environments with an intuitive control panel to reboot, deploy, or re-install OS templates in seconds."
    }
  ];

  return (
    <section className="why-section">
      
        <span className="why-badge">GLOBAL INFRASTRUCTURE STANDARDS</span>
        <h2>Why Developers & Businesses Trust ServerGo?</h2>
        <p className="subtitle">We deliver the ultimate high-availability cloud hosting environment to launch, scale, and secure your applications, systems, and gaming nodes with confidence.</p>
        <div className="why-features">
          {features.map((item, index) => (
            <div key={index} className="feature-card ">
              <div className="why-icon-wrapper d-flex gap-2 align-items-center">
                <i className={item.icon}></i>
                <h3 className='m-0'>{item.title}</h3>
              </div>
              
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
     
    </section>
  );
};

export default WhyUs;
