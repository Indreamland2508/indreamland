"use client";

import { useEffect } from "react";

type ChristmasIntroProps = {
  show: boolean;
  onEnter: () => void;
};

/**
 * Place this component inside the .hero section.
 * It renders aurora, shooting stars, a Santa fly-by and desktop cursor sparkles.
 */
export function ChristmasAtmosphere() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");

    if (reducedMotion.matches || coarsePointer.matches) return;

    let lastSpawn = 0;
    const symbols = ["✦", "✧", "·", "✴"];

    const handlePointerMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 38) return;
      lastSpawn = now;

      const particle = document.createElement("span");
      particle.className = "magic-cursor-particle";
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.setProperty("--particle-drift", `${(Math.random() - 0.5) * 34}px`);
      document.body.appendChild(particle);
      particle.addEventListener("animationend", () => particle.remove(), { once: true });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <>
      <div className="aurora-sky" aria-hidden="true">
        <span className="aurora aurora-one" />
        <span className="aurora aurora-two" />
        <span className="aurora aurora-three" />
      </div>
      <div className="shooting-stars" aria-hidden="true">
        <i className="shooting-star shooting-star-one" />
        <i className="shooting-star shooting-star-two" />
        <i className="shooting-star shooting-star-three" />
      </div>
      <div className="santa-flyby" aria-hidden="true">
        <span>🦌 🦌 🛷 🎅</span>
        <i />
      </div>
    </>
  );
}

/** Place once near the top of <main>. Control visibility with React state. */
export function ChristmasIntro({ show, onEnter }: ChristmasIntroProps) {
  if (!show) return null;

  return (
    <div className="christmas-intro" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div className="intro-star intro-star-one">✦</div>
      <div className="intro-star intro-star-two">✧</div>
      <div className="intro-star intro-star-three">✦</div>
      <p className="intro-kicker">A WINTER NIGHT FULL OF WONDER</p>
      <h1 id="intro-title">A Little <em>Christmas</em> World</h1>
      <p className="intro-copy">Take a breath, follow the lights, and step into a little holiday magic.</p>
      <button className="intro-enter" type="button" onClick={onEnter}>
        Enter the Christmas world <span>✦</span>
      </button>
      <span className="intro-footnote">BEST EXPERIENCED WITH SOUND ON</span>
    </div>
  );
}

/** Adds a gentle reveal to sections as they enter the viewport. */
export function ChristmasScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section:not(.hero), main > footer")
    );

    if (reduceMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("christmas-reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("christmas-reveal-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    sections.forEach((section) => {
      section.classList.add("christmas-reveal");
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
