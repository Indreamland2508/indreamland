'use client';

import { useEffect } from 'react';

const REVEAL_SELECTORS = [
  '.intro-grid > *', '.feature-card', '.world-heading-row > *', '.destination',
  '.stories-heading-row > *', '.story-item', '.studio-banner-content', '.activity-tile',
  '.gallery-heading-row > *', '.gallery-photo', '.gallery-note', '.countdown-copy',
  '.countdown-section .countdown-widget', '.world-map-heading > *', '.world-map-stage',
  '.world-selected-card', '.world-place-card', '.world-places-heading > *',
  '.experience-heading-row > *', '.surprise-controls', '.surprise-reveal',
  '.memory-game-panel', '.wish-intro', '.wish-workspace', '.experience-closing-inner > *',
];

export default function MotionDirector() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = Array.from(document.querySelectorAll(REVEAL_SELECTORS.join(',')));

    if (!reducedMotion && 'IntersectionObserver' in window && revealElements.length) {
      revealElements.forEach((element, index) => {
        element.classList.add('motion-reveal');
        element.style.setProperty('--motion-delay', `${(index % 4) * 75}ms`);
      });
      root.classList.add('motion-ready');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      revealElements.forEach((element) => observer.observe(element));

      const progress = document.createElement('div');
      progress.className = 'global-scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);
      let scrollFrame = 0;
      const updateProgress = () => {
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(() => {
          const scrollable = document.documentElement.scrollHeight - window.innerHeight;
          const amount = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
          progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
        });
      };
      updateProgress();
      window.addEventListener('scroll', updateProgress, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', updateProgress);
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        progress.remove();
        root.classList.remove('motion-ready');
      };
    }

    // The enhancement is progressive: without IntersectionObserver or when
    // reduced motion is requested, content remains visible and fully usable.
    return undefined;
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reducedMotion) return undefined;

    const glow = document.createElement('div');
    glow.className = 'pointer-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let frame = 0;
    const onPointerMove = (event) => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        glow.style.setProperty('--pointer-x', `${event.clientX}px`);
        glow.style.setProperty('--pointer-y', `${event.clientY}px`);
        glow.classList.add('is-active');
      });
    };
    const onPointerLeave = () => glow.classList.remove('is-active');
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      if (frame) cancelAnimationFrame(frame);
      glow.remove();
    };
  }, []);

  return null;
}
