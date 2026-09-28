import React, { useState } from 'react';
import './faqs.css';

const FaqSection = () => {
  // State لتتبع السؤال المفتوح حالياً (يفتح سؤال واحد فقط لمنع التشتيت)
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How long does it take to deploy a cloud server?",
      answer: "All our Cloud VPS and Windows servers feature instant deployment. Once your payment is verified via local billing gateways, your environment will be automatically configured and ready within 60 seconds."
    },
    {
      question: "Do your servers come with Full Root Access?",
      answer: "Yes, absolutely. Every virtual and dedicated server on ServerGo comes with 100% Full Root and Administrator access, giving you absolute control over your hosting environments, open ports, and configurations."
    },
    {
      question: "Can I scale or upgrade my server resources later?",
      answer: "Yes, you can easily scale up your server resources (RAM, CPU cores, and ultra-fast NVMe storage) at any time directly from your user dashboard without any data loss or server downtime."
    },
    {
      question: "Is automated DDoS protection included for free?",
      answer: "Yes, enterprise-grade automated DDoS protection is integrated by default into our local network infrastructure and protects all servers and domains 24/7 at no additional cost."
    },
    {
      question: "How can I register a local Syrian domain name?",
      answer: "You can search and register both global (.com, .net) and local Syrian extensions instantly through our standalone Domains page, with full DNS control panels mapped to your server nodes."
    }
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="maram-style-faq" dir="ltr">
      <div className="faq-container">
        <span className="faq-mini-tag">HAVE QUESTIONS?</span>
        <h2>Frequently Asked Questions</h2>
        <p className="faq-subtitle">Find instant answers to the most common questions about our local cloud infrastructure, server speeds, and domain management.</p>
        
        {/* بوكس الأكورديون التفاعلي المطابق لمرام */}
        <div className="faq-accordion-stack">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item-card ${activeIndex === index ? 'faq-active-open' : ''}`}>
              
              {/* زر نقر السؤال */}
              <button className="faq-trigger-btn" onClick={() => toggleFaq(index)}>
                <span className="faq-question-title">{faq.question}</span>
                <span className="faq-icon-holder">
                  <i className={`fa-solid ${activeIndex === index ? 'fa-minus' : 'fa-plus'}`}></i>
                </span>
              </button>
              
              {/* صندوق الإجابة المنزلق الانسيابي */}
              <div className="faq-response-panel">
                <div className="faq-response-inner">
                  <p>{faq.answer}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
