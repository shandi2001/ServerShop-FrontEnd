import React from 'react';
import { useNavigate } from 'react-router-dom'; // إذا كنت تستخدم React Router للتنقل
import './services_section.css';
import cloud from '../Assets/cloud.jpg';
import vps from '../Assets/vps.jpg';
import nvme from '../Assets/nvme.jpg';
import windows from '../Assets/windows.jpg';
const Services = () => {
  const navigate = useNavigate();
  const services = [
    {
      title: "Cloud VPS",
      image: cloud,
      link: "/servers",
      state: { targetTab: 'cloud' }
    },
    {
      title: "VPS Servers",
      image: vps,
      link: "/servers",
      state: { targetTab: 'vps' }
    },
    {
      title: "VPS-NVMe Servers",
      image: nvme,
      link: "/servers",
      state: { targetTab: 'nvme' }
    },
    {
      title: "Windows Servers",
      image: windows,
      link: "/servers",
      state: { targetTab: 'windows' }
    }
  ];

  const handleCardClick = (item) => {
    navigate(item.link, { state: item.state });
  };

  return (
    <section id="services-section" className="services-section">
      <span className="services-mini-tag">OUR SOLUTIONS</span>
      <h2>Explore Our Digital Services</h2>
      <p className="services-subtitle">Deploy enterprise-grade infrastructure and secure your digital identity instantly.</p>
      <div className="services-showcase d-flex flex-wrap justify-content-center gap-5">
        {services.map((item, index) => (
          <div key={index} className="showcase-card d-flex flex-column gap-2 align-items-center" onClick={() => handleCardClick(item)} >
            <img src={item.image} alt={item.title} className="showcase-img" />
            <h3>{item.title}</h3>
            <div className="showcase-arrow">
              <span>View Details</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
