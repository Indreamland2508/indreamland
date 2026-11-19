"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

type SnowParticle = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  sway: number;
  phase: number;
  phaseSpeed: number;
  opacity: number;
};

const wishes = [
  "May your days be merry, your nights be bright, and your heart be light.",
  "Wishing you a season wrapped in warmth, wonder, and a little bit of magic.",
  "May the smallest moments become your most treasured Christmas memories.",
  "Sending you peace like falling snow and joy that glows like Christmas lights.",
  "May kindness find you, laughter surround you, and wonder stay with you all year."
];

function getNextChristmas(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const christmas = new Date(year, 11, 25, 0, 0, 0, 0);
  return now < christmas ? christmas : new Date(year + 1, 11, 25, 0, 0, 0, 0);
}

function getCountdown(target: Date): Countdown {
  const distance = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance % 86_400_000) / 3_600_000),
    minutes: Math.floor((distance % 3_600_000) / 60_000),
    seconds: Math.floor((distance % 60_000) / 1_000)
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function HomePage() {
  const target = useMemo(() => getNextChristmas(), []);
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [letterOpen, setLetterOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [wishIndex, setWishIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [luckyGift, setLuckyGift] = useState<number | null>(null);
  const [chosenGift, setChosenGift] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const noteIndexRef = useRef(0);
  const snowCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setCountdown(getCountdown(target));
    const timer = window.setInterval(() => setCountdown(getCountdown(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  useEffect(() => {
    const canvas = snowCanvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    let particles: SnowParticle[] = [];
    let frameId = 0;
    let previousTime = 0;
    let windPhase = Math.random() * Math.PI * 2;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const createParticle = (randomY = true): SnowParticle => {
      const radius = 0.55 + Math.pow(Math.random(), 1.65) * 3.15;
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : -12 - Math.random() * 30,
        radius,
        speed: 0.22 + radius * 0.28 + Math.random() * 0.22,
        drift: (Math.random() - 0.5) * (0.12 + radius * 0.08),
        sway: 0.15 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.004 + Math.random() * 0.009,
        opacity: 0.2 + Math.random() * 0.62
      };
    };

    const draw = (delta = 16.67, animate = true) => {
      context.clearRect(0, 0, width, height);
      windPhase += 0.00045 * delta;

      for (const flake of particles) {
        if (animate) {
          flake.phase += flake.phaseSpeed * delta;
          const breeze = Math.sin(windPhase + flake.y * 0.0015) * 0.22;
          flake.x += (flake.drift + breeze + Math.sin(flake.phase) * flake.sway) * delta;
          flake.y += flake.speed * delta;
        }

        if (flake.y > height + 12) {
          flake.y = -10;
          flake.x = Math.random() * width;
        }
        if (flake.x < -15) flake.x = width + 10;
        if (flake.x > width + 15) flake.x = -10;

        context.globalAlpha = flake.opacity;
        context.beginPath();
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);

        if (flake.radius > 2.55) {
          const glow = context.createRadialGradient(
            flake.x - flake.radius * 0.28,
            flake.y - flake.radius * 0.3,
            0,
            flake.x,
            flake.y,
            flake.radius * 1.5
          );
          glow.addColorStop(0, "rgba(255,255,255,1)");
          glow.addColorStop(0.55, "rgba(239,247,250,0.92)");
          glow.addColorStop(1, "rgba(223,238,245,0.12)");
          context.fillStyle = glow;
          context.shadowBlur = 5;
          context.shadowColor = "rgba(239,247,255,0.45)";
        } else {
          context.fillStyle = "rgba(248,252,255,0.96)";
          context.shadowBlur = flake.radius > 1.6 ? 2 : 0;
          context.shadowColor = "rgba(239,247,255,0.3)";
        }

        context.fill();
      }

      context.globalAlpha = 1;
      context.shadowBlur = 0;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const particleCount = Math.max(
        78,
        Math.min(220, Math.round((width * height) / (reducedMotion ? 15500 : 7800)))
      );
      particles = Array.from({ length: particleCount }, () => createParticle(true));
      draw(0, false);
    };

    const animate = (time: number) => {
      if (document.hidden || reducedMotion) return;
      const delta = previousTime ? Math.min(time - previousTime, 32) : 16.67;
      previousTime = time;
      draw(delta, true);
      frameId = window.requestAnimationFrame(animate);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        previousTime = 0;
      } else if (!reducedMotion) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      window.cancelAnimationFrame(frameId);
      previousTime = 0;
      resize();
      if (!reducedMotion && !document.hidden) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    resize();
    if (!reducedMotion) frameId = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", onMotionPreferenceChange);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      context.clearRect(0, 0, width, height);
    };
  }, []);

  useEffect(() => {
    if (!letterOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLetterOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [letterOpen]);

  const stopMusic = () => {
    if (musicTimerRef.current !== null) {
      window.clearInterval(musicTimerRef.current);
      musicTimerRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMusicOn(false);
  };

  const toggleMusic = () => {
    if (musicOn) {
      stopMusic();
      return;
    }

    const context = new window.AudioContext();
    audioContextRef.current = context;
    const melody = [659.25, 783.99, 880, 783.99, 698.46, 587.33, 523.25, 587.33, 659.25, 783.99];
    const playChime = () => {
      const frequency = melody[noteIndexRef.current % melody.length];
      noteIndexRef.current += 1;
      const oscillator = context.createOscillator();
      const volume = context.createGain();
      const now = context.currentTime;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      volume.gain.setValueAtTime(0.0001, now);
      volume.gain.exponentialRampToValueAtTime(0.045, now + 0.035);
      volume.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      oscillator.connect(volume);
      volume.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.44);
    };

    void context.resume().then(playChime).catch(() => setMusicOn(false));
    musicTimerRef.current = window.setInterval(playChime, 540);
    setMusicOn(true);
  };

  useEffect(() => () => {
    if (musicTimerRef.current !== null) window.clearInterval(musicTimerRef.current);
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  const startGame = () => {
    setLuckyGift(Math.floor(Math.random() * 3));
    setChosenGift(null);
    setGameStarted(true);
  };

  const chooseGift = (index: number) => {
    if (chosenGift !== null || luckyGift === null) return;
    setChosenGift(index);
  };

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <canvas ref={snowCanvasRef} className="snowfall-canvas" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#home" aria-label="A Little Christmas World home">
          <span className="brand-mark">✳</span>
          <span>A LITTLE <b>CHRISTMAS</b> WORLD</span>
        </a>
        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /> <span />
        </button>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <button onClick={() => scrollTo("home")}>Home</button>
          <button onClick={() => scrollTo("countdown")}>Countdown</button>
          <button onClick={() => scrollTo("wishes")}>Wishes</button>
          <button onClick={() => scrollTo("surprise")}>Surprise</button>
          <button onClick={() => scrollTo("memories")}>Memories</button>
        </nav>
        <button className="music-toggle" type="button" onClick={toggleMusic} aria-pressed={musicOn}><span>♫</span> {musicOn ? "Sound on" : "Sound off"}</button>
        <button className="header-wish" onClick={() => scrollTo("wishes")}>Make a wish <span>↗</span></button>
      </header>

      <section className="hero" id="home">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="hero-content">
          <div className="eyebrow"><span /> THE MOST WONDERFUL TIME OF THE YEAR <span /></div>
          <h1>Let the world<br />feel a little more <em>magic.</em></h1>
          <p className="hero-copy">A little wonder, a little warmth, and a whole lot of Christmas cheer. Welcome to a place where the season comes alive.</p>
          <div className="hero-actions">
            <button className="button button-gold" onClick={() => scrollTo("countdown")}>Explore the magic <span>↗</span></button>
            <button className="button button-quiet" onClick={() => setLetterOpen(true)}><span className="play-icon">✉</span> Open a Christmas letter</button>
          </div>
          <div className="hero-note"><span className="tiny-star">✦</span> MADE OF LITTLE MOMENTS & BIG MAGIC</div>
        </div>
        <div className="hero-art" aria-label="Illustration of a glowing Christmas tree in a winter night">
          <div className="moon" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="tree-shadow" />
          <div className="christmas-tree">
            <div className="tree-layer layer-one" />
            <div className="tree-layer layer-two" />
            <div className="tree-layer layer-three" />
            <div className="tree-layer layer-four" />
            <div className="tree-trunk" />
            <span className="tree-star">✦</span>
            <i className="tree-light light-one" /><i className="tree-light light-two" />
            <i className="tree-light light-three" /><i className="tree-light light-four" />
            <i className="tree-light light-five" /><i className="tree-light light-six" />
            <i className="tree-light light-seven" /><i className="tree-light light-eight" />
            <i className="tree-bauble bauble-one" /><i className="tree-bauble bauble-two" />
            <i className="tree-bauble bauble-three" /><i className="tree-bauble bauble-four" />
            <i className="tree-bauble bauble-five" /><i className="tree-bauble bauble-six" />
            <i className="tree-bauble bauble-seven" /><i className="tree-bauble bauble-eight" />
          </div>
          <div className="present present-one"><span /></div>
          <div className="present present-two"><span /></div>
          <div className="present present-three"><span /></div>
          <div className="little-spark spark-one">✦</div><div className="little-spark spark-two">✧</div>
          <div className="little-spark spark-three">✦</div><div className="little-spark spark-four">·</div>
          <div className="hill hill-back" /><div className="hill hill-front" />
          <div className="art-caption"><span>✧</span> A season sprinkled with wonder</div>
        </div>
        <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><i /></div>
      </section>

      <section className="countdown-section section-pad" id="countdown">
        <div className="section-heading centered">
          <span className="section-kicker">SAVE A LITTLE SPACE FOR MAGIC</span>
          <h2>The magic is <em>almost here.</em></h2>
          <p>Every second brings us closer to the most wonderful day of the year.</p>
        </div>
        <div className="countdown-wrap">
          <div className="countdown-card"><strong>{pad(countdown.days)}</strong><span>DAYS</span></div>
          <b className="countdown-separator">:</b>
          <div className="countdown-card"><strong>{pad(countdown.hours)}</strong><span>HOURS</span></div>
          <b className="countdown-separator">:</b>
          <div className="countdown-card"><strong>{pad(countdown.minutes)}</strong><span>MINUTES</span></div>
          <b className="countdown-separator">:</b>
          <div className="countdown-card"><strong>{pad(countdown.seconds)}</strong><span>SECONDS</span></div>
        </div>
        <div className="countdown-date"><span>✦</span> DECEMBER 25, {target.getFullYear()} <span>✦</span></div>
      </section>

      <section className="letter-section section-pad" id="letter">
        <div className="letter-art" aria-hidden="true">
          <div className="letter-branch branch-left">✦<span>⌁</span></div>
          <div className="envelope"><div className="envelope-paper"><span>Dear Christmas dreamer,</span><i>May your days be merry...</i></div><div className="envelope-flap" /><div className="wax-seal">✦</div></div>
          <div className="letter-spark spark-a">✧</div><div className="letter-spark spark-b">✦</div>
        </div>
        <div className="letter-copy">
          <span className="section-kicker">A NOTE FROM THE NORTH POLE</span>
          <h2>A little letter,<br />a lot of <em>love.</em></h2>
          <p>Some things are better when they are shared: warm wishes, kind thoughts, and the simple joy of knowing someone is thinking of you.</p>
          <button className="button button-outline" onClick={() => setLetterOpen(true)}>Read the Christmas letter <span>↗</span></button>
        </div>
      </section>

      <section className="wish-section section-pad" id="wishes">
        <div className="wish-card">
          <div className="wish-decoration wish-deco-left">✳</div><div className="wish-decoration wish-deco-right">✧</div>
          <span className="section-kicker">A WISH JUST FOR YOU</span>
          <h2>Words that <em>warm the heart.</em></h2>
          <div className="wish-quote-mark">“</div>
          <p className="wish-text" aria-live="polite">{wishes[wishIndex]}</p>
          <button className="button button-gold" onClick={() => setWishIndex((index) => (index + 1) % wishes.length)}>Give me another wish <span>✦</span></button>
          <div className="wish-counter">{String(wishIndex + 1).padStart(2, "0")} <i>/</i> {String(wishes.length).padStart(2, "0")}</div>
        </div>
      </section>

      <section className="surprise-section section-pad" id="surprise">
        <div className="section-heading centered">
          <span className="section-kicker">A LITTLE SOMETHING, JUST BECAUSE</span>
          <h2>Unwrap a little <em>wonder.</em></h2>
          <p>Every gift holds a tiny reminder that magic can show up when you least expect it.</p>
        </div>
        <div className={giftOpen ? "big-gift is-open" : "big-gift"}>
          <div className="gift-sparkles" aria-hidden="true"><span>✧</span><span>✦</span><span>·</span><span>✧</span></div>
          <div className="gift-lid"><i /></div>
          <div className="gift-box"><i className="gift-ribbon-vertical" /><i className="gift-ribbon-horizontal" /></div>
          {giftOpen && <div className="gift-reveal"><span>✦</span><strong>A little more joy<br />for your world.</strong><small>YOU DESERVE ALL THE MAGIC</small></div>}
        </div>
        <button className="button button-gold gift-button" onClick={() => setGiftOpen((open) => !open)}>{giftOpen ? "Wrap it up again" : "Open your surprise"} <span>{giftOpen ? "↻" : "✧"}</span></button>
        <p className="gift-hint">Psst... there is a little magic inside.</p>
      </section>

      <section className="memories-section section-pad" id="memories">
        <div className="section-heading memories-heading">
          <span className="section-kicker">POSTCARDS FROM A WINTER DREAM</span>
          <h2>Little moments.<br /><em>Endless memories.</em></h2>
          <p>A few snapshots of the season we all know by heart.</p>
        </div>
        <div className="memory-grid">
          <article className="memory-card memory-tall"><div className="memory-scene scene-forest"><span className="scene-moon">☾</span><i className="mini-tree tree-a">♠</i><i className="mini-tree tree-b">♠</i><i className="mini-tree tree-c">♠</i><span className="scene-snow">✦</span></div><div className="memory-label"><span>01 / WINTER NIGHTS</span><b>Under a blanket of stars</b></div></article>
          <article className="memory-card"><div className="memory-scene scene-fire"><span className="fireplace">▤</span><span className="candle">♨</span><i className="fire-spark">✦</i></div><div className="memory-label"><span>02 / COZY MOMENTS</span><b>Where warmth feels like home</b></div></article>
          <article className="memory-card"><div className="memory-scene scene-baubles"><span className="bauble big-bauble">✧</span><span className="bauble small-bauble">✦</span><span className="bauble red-bauble">·</span><i className="pine-branch">❧</i></div><div className="memory-label"><span>03 / LITTLE DETAILS</span><b>Made to sparkle</b></div></article>
        </div>
        <p className="gallery-note">A little illustrated moodboard for the season. Your own Christmas photos can live here, too.</p>
      </section>

      <section className="game-section section-pad" id="game">
        <div className="game-panel">
          <div className="game-copy">
            <span className="section-kicker">A TINY CHRISTMAS CHALLENGE</span>
            <h2>Find the hidden <em>star.</em></h2>
            <p>One of these little presents is hiding a golden star. Trust your holiday instincts and choose wisely.</p>
            <button className="button button-gold" onClick={startGame}>{gameStarted ? "Play another round" : "Start the little game"} <span>↗</span></button>
            {chosenGift !== null && <p className="game-result" aria-live="polite">{chosenGift === luckyGift ? "You found the golden star! A little extra Christmas magic is yours. ✨" : "So close! The star was hiding in another present. Give it another try!"}</p>}
          </div>
          <div className="game-gifts" aria-label="Choose one of three Christmas presents">
            {[0, 1, 2].map((index) => {
              const revealed = chosenGift !== null;
              const isLucky = index === luckyGift;
              return (
                <button
                  className={`game-gift game-gift-${index + 1}${chosenGift === index ? " selected" : ""}${revealed && isLucky ? " lucky" : ""}`}
                  key={index}
                  onClick={() => chooseGift(index)}
                  disabled={!gameStarted || chosenGift !== null}
                  aria-label={`Choose present ${index + 1}${revealed && isLucky ? ", contains the star" : ""}`}
                >
                  <span className="game-box-lid" /><span className="game-box-body"><i /></span>
                  {revealed && isLucky && <span className="found-star">✦</span>}
                  {revealed && chosenGift === index && !isLucky && <span className="empty-mark">·</span>}
                </button>
              );
            })}
          </div>
          {!gameStarted && <span className="game-hint">PRESS START TO PLAY</span>}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-star">✦</div>
        <p className="footer-kicker">MAY YOUR SEASON BE BRIGHT</p>
        <h2>Merry <em>Christmas.</em></h2>
        <p className="footer-message">May your days be filled with little wonders, warm memories,<br />and all the magic your heart can hold.</p>
        <button className="back-top" onClick={() => scrollTo("home")}>BACK TO THE TOP ↑</button>
        <div className="footer-bottom"><span>© 2026 A LITTLE CHRISTMAS WORLD</span><span>MADE WITH ✦ & A LITTLE MAGIC</span></div>
      </footer>

      {letterOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setLetterOpen(false); }}>
          <section className="letter-modal" role="dialog" aria-modal="true" aria-labelledby="letter-title">
            <button className="modal-close" onClick={() => setLetterOpen(false)} aria-label="Close letter">×</button>
            <div className="modal-holly">✧ ❧ ✧</div>
            <span className="section-kicker">A CHRISTMAS NOTE</span>
            <h2 id="letter-title">Dear Christmas dreamer,</h2>
            <p>May this season bring you moments worth remembering, people worth holding close, and reasons to smile when you least expect them.</p>
            <p>May you find wonder in the little things: the glow of a window, the sound of laughter, a thoughtful note, or a quiet moment beneath the winter sky.</p>
            <p className="modal-signoff">With warmth & wonder,<br /><em>Your Christmas World</em> <span>✦</span></p>
            <button className="button button-gold" onClick={() => setLetterOpen(false)}>Keep this little wish <span>♡</span></button>
          </section>
        </div>
      )}
    </main>
  );
}
