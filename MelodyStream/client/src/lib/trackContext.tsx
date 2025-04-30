import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TrackWithDetails } from '@shared/schema';
import { apiRequest } from './queryClient';

interface TrackContextType {
  currentTrack: TrackWithDetails | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: TrackWithDetails[];
  setTrack: (track: TrackWithDetails) => void;
  playTrack: (track: TrackWithDetails) => void;
  pauseTrack: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: TrackWithDetails) => void;
  clearQueue: () => void;
}

const TrackContext = createContext<TrackContextType | undefined>(undefined);

export function TrackProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<TrackWithDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueue] = useState<TrackWithDetails[]>([]);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    const audioElement = new Audio();
    setAudio(audioElement);

    // Set up event listeners
    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    const handleLoadedMetadata = () => setDuration(audioElement.duration);
    const handleEnded = () => {
      // Play next track if available
      if (queue.length > 0) {
        const nextTrack = queue[0];
        const newQueue = queue.slice(1);
        setQueue(newQueue);
        playTrackInternal(nextTrack, audioElement);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);

    // Set initial volume
    audioElement.volume = volume;

    return () => {
      // Clean up event listeners
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.pause();
    };
  }, [queue]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

  // Log recently played track
  useEffect(() => {
    if (currentTrack && isPlaying) {
      // Record this track as recently played for user 1 (demo user)
      const logRecentlyPlayed = async () => {
        try {
          await apiRequest('POST', '/api/recently-played', {
            userId: 1, // Demo user
            trackId: currentTrack.id
          });
        } catch (error) {
          console.error('Failed to log recently played track:', error);
        }
      };
      
      logRecentlyPlayed();
    }
  }, [currentTrack]);

  const playTrackInternal = (track: TrackWithDetails, audioElement: HTMLAudioElement) => {
    setCurrentTrack(track);
    // In a real app, we would use the actual URL from the track.url
    // For this demo, we're using a single audio file for demonstration
    audioElement.src = 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav';
    audioElement.load();
    audioElement.play()
      .then(() => setIsPlaying(true))
      .catch(err => {
        console.error('Failed to play audio:', err);
        setIsPlaying(false);
      });
  };

  const setTrack = (track: TrackWithDetails) => {
    if (!audio) return;
    setCurrentTrack(track);
    // Don't automatically play
  };

  const playTrack = (track: TrackWithDetails) => {
    if (!audio) return;
    playTrackInternal(track, audio);
  };

  const pauseTrack = () => {
    if (audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error('Failed to play audio:', err);
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;
    
    const nextTrack = queue[0];
    const newQueue = queue.slice(1);
    setQueue(newQueue);
    
    if (audio) {
      playTrackInternal(nextTrack, audio);
    }
  };

  const prevTrack = () => {
    if (!audio || !currentTrack) return;
    
    // If current time is less than 3 seconds, go to previous track
    // Otherwise, restart current track
    if (currentTime < 3) {
      // In a real app, we would have a history of tracks
      // For this demo, just restart the current track
      audio.currentTime = 0;
    } else {
      audio.currentTime = 0;
    }
  };

  const seekTo = (time: number) => {
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const addToQueue = (track: TrackWithDetails) => {
    setQueue(prev => [...prev, track]);
  };

  const clearQueue = () => {
    setQueue([]);
  };

  return (
    <TrackContext.Provider value={{
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      queue,
      setTrack,
      playTrack,
      pauseTrack,
      togglePlayPause,
      nextTrack,
      prevTrack,
      seekTo,
      setVolume,
      addToQueue,
      clearQueue,
    }}>
      {children}
    </TrackContext.Provider>
  );
}

export function useTrack() {
  const context = useContext(TrackContext);
  if (context === undefined) {
    throw new Error('useTrack must be used within a TrackProvider');
  }
  return context;
}
