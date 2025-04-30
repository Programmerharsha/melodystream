import { useState, useEffect, useRef } from 'react';

interface UseAudioProps {
  src?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

interface UseAudioReturn {
  playing: boolean;
  duration: number;
  currentTime: number;
  togglePlay: () => void;
  pause: () => void;
  play: () => Promise<void>;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  volume: number;
  muted: boolean;
}

export function useAudio({ src, autoPlay = false, onEnded }: UseAudioProps = {}): UseAudioReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  // Initialize audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Set up event listeners
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', () => setPlaying(true));
    audio.addEventListener('pause', () => setPlaying(false));
    audio.volume = volume;
    audio.muted = muted;

    return () => {
      // Clean up event listeners
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', () => setPlaying(true));
      audio.removeEventListener('pause', () => setPlaying(false));
      audio.pause();
    };
  }, []);

  // Update audio source when src changes
  useEffect(() => {
    if (!audioRef.current || !src) return;

    audioRef.current.src = src;
    audioRef.current.load();
    
    if (autoPlay) {
      play();
    }
  }, [src]);

  // Update volume and muted state
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
  }, [muted]);

  // Event handlers
  const handleDurationChange = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (onEnded) {
      onEnded();
    }
  };

  // Control functions
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play()
        .catch(err => console.error('Error playing audio:', err));
    }
  };

  const play = async () => {
    if (!audioRef.current) return Promise.reject(new Error('No audio element'));
    
    try {
      await audioRef.current.play();
      return Promise.resolve();
    } catch (err) {
      console.error('Error playing audio:', err);
      return Promise.reject(err);
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const mute = () => {
    setPrevVolume(volume);
    setVolumeState(0);
    setMuted(true);
  };

  const unmute = () => {
    setVolumeState(prevVolume);
    setMuted(false);
  };

  return {
    playing,
    duration,
    currentTime,
    togglePlay,
    play,
    pause,
    seekTo,
    setVolume,
    mute,
    unmute,
    volume,
    muted
  };
}
