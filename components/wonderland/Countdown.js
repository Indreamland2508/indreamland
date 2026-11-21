'use client';

import { useEffect, useState } from 'react';

function getCountdown() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 11, 25, 0, 0, 0, 0);
  if (now >= target) target = new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0, 0);

  const total = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return { days, hours, minutes, seconds, year: target.getFullYear() };
}

export default function Countdown({ compact = false }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(getCountdown());
    const timer = window.setInterval(() => setTime(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const units = [
    ['Ngày', time?.days],
    ['Giờ', time?.hours],
    ['Phút', time?.minutes],
    ['Giây', time?.seconds],
  ];

  return (
    <div className={`countdown-widget${compact ? ' countdown-compact' : ''}`} aria-label="Đếm ngược đến Giáng sinh">
      <div className="countdown-heading">
        <span className="countdown-sparkle" aria-hidden="true">✧</span>
        <span>{compact ? 'COUNTING DOWN TO' : 'THE MOST WONDERFUL TIME OF THE YEAR'}</span>
        <span className="countdown-sparkle" aria-hidden="true">✧</span>
      </div>
      <div className="countdown-units">
        {units.map(([label, value]) => (
          <div className="countdown-unit" key={label}>
            <strong>{value === undefined ? '––' : String(value).padStart(label === 'Ngày' ? 2 : 2, '0')}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <p className="countdown-foot">A little closer to the magic · {time?.year || 'Christmas'}</p>
    </div>
  );
}
