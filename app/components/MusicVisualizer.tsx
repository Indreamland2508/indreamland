"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

type AudioRef = RefObject<HTMLAudioElement | null>;

/**
 * Connects an existing HTMLAudioElement to Web Audio once and exposes its analyser.
 * Call resumeAudio() directly from the same click handler that starts audio playback.
 */
export function useChristmasAudioAnalyser(audioRef: AudioRef) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || typeof window === "undefined" || !("AudioContext" in window)) return;

    let context: AudioContext | null = null;
    let source: MediaElementAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;

    try {
      context = new window.AudioContext();
      analyser = context.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;
      source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);

      contextRef.current = context;
      analyserRef.current = analyser;
    } catch (error) {
      console.warn("Music visualizer could not connect to the audio element.", error);
      if (context) void context.close();
    }

    return () => {
      analyserRef.current = null;
      contextRef.current = null;
      try {
        source?.disconnect();
        analyser?.disconnect();
      } catch {
        // The audio graph may already have been disconnected by the browser.
      }
      if (context && context.state !== "closed") void context.close();
      document.documentElement.style.removeProperty("--music-glow");
    };
  }, [audioRef]);

  const resumeAudio = useCallback(async () => {
    const context = contextRef.current;
    if (context && context.state === "suspended") {
      await context.resume();
    }
  }, []);

  return { analyserRef, resumeAudio };
}

type MusicVisualizerProps = {
  analyserRef: RefObject<AnalyserNode | null>;
  active: boolean;
};

/** A compact canvas equalizer. It also drives the CSS glow on the Christmas tree. */
export function MusicVisualizer({ analyserRef, active }: MusicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const analyser = analyserRef.current;
    if (!canvas || !context || !analyser || !active) {
      if (context && canvas) context.clearRect(0, 0, canvas.width, canvas.height);
      document.documentElement.style.setProperty("--music-glow", "8px");
      return;
    }

    const values = new Uint8Array(analyser.frequencyBinCount);
    const barCount = 18;
    let frameId = 0;

    const draw = () => {
      analyser.getByteFrequencyData(values);
      context.clearRect(0, 0, canvas.width, canvas.height);

      const step = Math.max(1, Math.floor(values.length / barCount));
      const gap = 3;
      const barWidth = (canvas.width - gap * (barCount - 1)) / barCount;
      let total = 0;

      for (let index = 0; index < barCount; index += 1) {
        const magnitude = values[index * step] / 255;
        total += magnitude;
        const barHeight = Math.max(3, magnitude * (canvas.height - 3));
        const x = index * (barWidth + gap);
        const y = (canvas.height - barHeight) / 2;
        const gradient = context.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#fff0bd");
        gradient.addColorStop(1, "#c58b3d");
        context.fillStyle = gradient;
        context.globalAlpha = 0.55 + magnitude * 0.45;
        context.beginPath();
        context.roundRect(x, y, barWidth, barHeight, 3);
        context.fill();
      }

      context.globalAlpha = 1;
      const level = total / barCount;
      document.documentElement.style.setProperty("--music-glow", `${8 + level * 28}px`);
      frameId = window.requestAnimationFrame(draw);
    };

    frameId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frameId);
      document.documentElement.style.setProperty("--music-glow", "8px");
    };
  }, [active, analyserRef]);

  return <canvas ref={canvasRef} className="music-visualizer" width={180} height={42} aria-hidden="true" />;
}
