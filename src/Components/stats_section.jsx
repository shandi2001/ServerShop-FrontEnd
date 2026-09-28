import React, { useEffect, useRef, useState } from 'react';
import './stats_section.css';

const formatAnimatedValue = (value, suffix = '') => {
  if (!Number.isFinite(value)) return suffix;

  const formatted = Number.isInteger(value)
    ? new Intl.NumberFormat('en-US').format(value)
    : value.toFixed(2).replace(/\.00$/, '');

  return `${formatted}${suffix}`;
};

// ثابتة خارج المكوّن حتى لا تُعاد إنشاؤها كل رندر وتكسر تبعيات الـ useEffect
const stats = [
    { number: "99.99%", label: "Network Uptime", icon: "fa-solid fa-chart-line", target: 99.99, suffix: "%" },
    { number: "25ms", label: "Average Latency", icon: "fa-solid fa-gauge-high", target: 25, suffix: "ms" },
    { number: "15,000+", label: "Active Servers", icon: "fa-solid fa-server", target: 15000, suffix: "+" },
  { number: "24/7/365", label: "Global Monitoring", icon: "fa-solid fa-clock", target: null, suffix: "" }
];

const Stats = () => {
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!sectionRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const nextCounts = stats.map((item, index) => {
          if (item.target === null) return item.number;

          const duration = 1400 + index * 150;
          const start = performance.now();

          return new Promise((resolve) => {
            const tick = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - (1 - progress) ** 3;
              const currentValue = item.target * eased;

              setCounts((prev) => {
                const next = [...prev];
                next[index] = currentValue;
                return next;
              });

              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                setCounts((prev) => {
                  const next = [...prev];
                  next[index] = item.target;
                  return next;
                });
                resolve();
              }
            };

            requestAnimationFrame(tick);
          });
        });

        Promise.all(nextCounts.filter(Boolean)).then(() => setHasAnimated(true));
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section className="servergo-stats-section" dir="ltr" ref={sectionRef}>
      <div className="stats-container">
        <span className="stats-mini-tag">PLATFORM METRICS</span>
        <h2>ServerGo Live Infrastructure Numbers</h2>
        <p className="stats-subtitle">Real-time enterprise network capability powering next-generation cloud architectures and identities worldwide.</p>
        
        <div className="stats-cards-grid">
          {stats.map((item, index) => {
            const displayValue = item.target === null
              ? item.number
              : formatAnimatedValue(counts[index], item.suffix);

            return (
              <div key={index} className="stat-data-card">
                <div className="stat-circle-icon">
                  <i className={item.icon}></i>
                </div>
                <h3>{displayValue}</h3>
                <p>{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
