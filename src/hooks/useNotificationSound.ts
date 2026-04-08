import { useRef, useEffect, useState, useCallback } from "react";

interface UseNotificationSoundOptions {
  soundUrl?: string;
  volume?: number;
  enabled?: boolean;
}

export function useNotificationSound(
  options: UseNotificationSoundOptions = {}
) {
  const {
    soundUrl = "/notification.wav",
    volume = 0.6,
    enabled = true,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const audio = new Audio(soundUrl);
    audio.preload = "auto";
    audio.volume = volume;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
      unlockedRef.current = false;
      setIsAudioReady(false);
    };
  }, [soundUrl, volume, enabled]);

  const unlockAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || unlockedRef.current) return;

    audio.muted = true;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;

          unlockedRef.current = true;
          setIsAudioReady(true);
        })
        .catch(() => {
          // ignore – user gesture not valid yet
        });
    }
  }, []);

  /**
   * Attach unlock listeners
   */
  useEffect(() => {
    if (!enabled || isAudioReady) return;

    document.addEventListener("click", unlockAudio, { once: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
    document.addEventListener("touchstart", unlockAudio, { once: true });

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
  }, [enabled, isAudioReady, unlockAudio]);

  /**
   * Play sound (safe for SSE / WebSocket)
   */
  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!enabled || !audio || !unlockedRef.current) return;

    try {
      audio.currentTime = 0;
      audio.play(); // ❗ no await
    } catch {
      // never throw
    }
  }, [enabled]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, v));
    }
  }, []);

  return {
    play,
    pause,
    setVolume,
    unlockAudio, // optional manual unlock button
    isAudioReady,
  };
}