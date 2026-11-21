'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const links = [
  ['Khám phá', '/world', 'world'],
  ['Câu chuyện', '/#stories', 'stories'],
  ['Hoạt động', '/experiences', 'activities'],
  ['Thư viện', '/#gallery', 'gallery'],
  ['Đếm ngược', '/#countdown', 'countdown'],
];

const bellNotes = [659.25, 783.99, 987.77, 783.99, 698.46, 587.33];

function playSoftBell(context, noteIndex) {
  const now = context.currentTime;
  const frequency = bellNotes[noteIndex % bellNotes.length];
  [1, 2.01, 3.91].forEach((partial, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 0 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency * partial, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.025 : 0.006, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (index === 0 ? 2.1 : 1.25));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 2.2);
  });
}

export default function SiteHeader({ onCreateCard }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundUnavailable, setSoundUnavailable] = useState(false);
  const pathname = usePathname();
  const audioContextRef = useRef(null);
  const soundTimerRef = useRef(null);
  const noteIndexRef = useRef(0);

  // Keep the server HTML and the first browser render identical. Pathname can
  // differ during rewrites or stale dev HMR, so it only controls active UI
  // after hydration; hrefs below are deliberately static.
  useEffect(() => setMounted(true), []);

  useEffect(() => () => {
    if (soundTimerRef.current) window.clearInterval(soundTimerRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const createCard = () => {
    closeMenu();
    if (onCreateCard) onCreateCard();
    else window.location.assign('/#studio');
  };

  const toggleSound = async () => {
    if (soundEnabled) {
      if (soundTimerRef.current) window.clearInterval(soundTimerRef.current);
      soundTimerRef.current = null;
      audioContextRef.current?.suspend().catch(() => {});
      setSoundEnabled(false);
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setSoundUnavailable(true);
      return;
    }

    try {
      const context = audioContextRef.current || new AudioContextClass();
      audioContextRef.current = context;
      await context.resume();
      playSoftBell(context, noteIndexRef.current++);
      soundTimerRef.current = window.setInterval(() => {
        if (context.state === 'running') playSoftBell(context, noteIndexRef.current++);
      }, 9000);
      setSoundUnavailable(false);
      setSoundEnabled(true);
    } catch {
      setSoundUnavailable(true);
      setSoundEnabled(false);
    }
  };

  return (
    <header className="wonder-header">
      <a className="skip-link" href="#top">Bỏ qua điều hướng</a>
      <a className="brand" href="/" aria-label="Christmas Wonderland - Trang chủ" onClick={closeMenu}>
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 58" role="presentation">
            <path d="M24 3 7 26h10L4 40h15v13h10V40h15L31 26h10L24 3Z" />
            <path d="M24 10v34M13 30h22M9 43h30" />
            <path d="M24 1v-1" />
          </svg>
          <i />
        </span>
        <span className="brand-copy">
          <strong>Christmas</strong>
          <small>WONDERLAND</small>
        </span>
      </a>

      <button
        className={`mobile-menu-toggle${menuOpen ? ' is-open' : ''}`}
        type="button"
        aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={menuOpen}
        aria-controls="wonderland-main-nav"
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span /><span /><span />
      </button>

      <nav id="wonderland-main-nav" className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Điều hướng chính">
        {links.map(([label, href, key]) => {
          const active = mounted && ((pathname === '/world' && key === 'world') || (pathname === '/experiences' && key === 'activities'));
          return (
            <a
              key={key}
              href={href}
              className={`nav-link${active ? ' nav-link-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={closeMenu}
            >
              {label}
            </a>
          );
        })}
        <button className="mobile-sound-toggle" type="button" onClick={toggleSound} aria-pressed={soundEnabled}>
          <span aria-hidden="true">{soundEnabled ? '♫' : '♪'}</span> Âm thanh mùa đông <small>{soundEnabled ? 'Đang bật' : 'Đang tắt'}</small>
        </button>
        <button className="nav-create-mobile" type="button" onClick={createCard}>
          Tạo thiệp <span aria-hidden="true">↗</span>
        </button>
      </nav>

      <div className="header-actions">
        <button
          className={`soundscape-toggle${soundEnabled ? ' is-on' : ''}`}
          type="button"
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? 'Tắt âm thanh Giáng sinh' : 'Bật âm thanh Giáng sinh'}
          title={soundUnavailable ? 'Trình duyệt chưa hỗ trợ âm thanh này' : soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          <span aria-hidden="true">{soundEnabled ? '♫' : '♪'}</span>
        </button>
        <span className="season-status"><i /> Mùa lễ hội đã đến</span>
        <button className="header-create" type="button" onClick={createCard}>
          Tạo thiệp <span aria-hidden="true">✦</span>
        </button>
      </div>
    </header>
  );
}
