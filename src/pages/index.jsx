import React, { useEffect, useRef, useState } from "react";
import Hero from "../Components/hero_section";
import Services from "../Components/services_section";
import Location from "../Components/location_section";
import Whyus from "../Components/whyus";
import Stats from "../Components/stats_section";
import Testimonials from "../Components/rating";
import FaqSection from "../Components/faqs";

const RevealSection = ({ children }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(5px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
};

const Home = () => {
   return (
      <div>
         <Hero />
         <RevealSection><Services /></RevealSection>
         <RevealSection><Whyus /></RevealSection>
         <RevealSection><Location /></RevealSection>
         <RevealSection><Stats /></RevealSection>
         <RevealSection><Testimonials /></RevealSection>
         <RevealSection><FaqSection /></RevealSection>
      </div>
   );
};
export default Home;