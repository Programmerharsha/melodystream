import { useState, useEffect } from 'react';
import { audioPlayer } from '@/lib/audio-player';

export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState(audioPlayer.currentTrack);
  const [isPlaying, setIsPlaying] = useState(audioPlayer.isPlaying);
  const [volume, setVolume] = useState(audioPlayer.volume);
  const [currentTime, setCurrentTime] = useState(audioPlayer.currentTime);
  const [duration, setDuration] = useState(audioPlayer.duration);
  const [queue, setQueue] = useState(audioPlayer.queue);

  useEffect(() => {
    // Subscribe to audio player updates
    const unsubscribe = audioPlayer.subscribe(() => {
      setCurrentTrack(audioPlayer.currentTrack);
      setIsPlaying(audioPlayer.isPlaying);
      setVolume(audioPlayer.volume);
      setCurrentTime(audioPlayer.currentTime);
      setDuration(audioPlayer.duration);
      setQueue(audioPlayer.queue);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Helper methods for component interactions
  const togglePlay = () => {
    audioPlayer.togglePlay();
  };

  const seekTo = (time: number) => {
    audioPlayer.seekTo(time);
  };

  const setVolumeAndUpdate = (newVolume: number) => {
    audioPlayer.setVolume(newVolume);
  };

  const playTrack = (track: any, playlistId?: number) => {
    // Enhance track with playlist info if needed
    const enhancedTrack = playlistId ? { ...track, playlistId } : track;
    audioPlayer.loadTrack(enhancedTrack);
    audioPlayer.play();
  };

  const playNext = () => {
    audioPlayer.playNext();
  };

  const playPrevious = () => {
    audioPlayer.playPrevious();
  };

  const playAlbum = (album: any) => {
    if (album.tracks && album.tracks.length > 0) {
      // Enhance tracks with album information if not already present
      const tracksWithAlbum = album.tracks.map((track: any) => ({
        ...track,
        album: track.album || {
          id: album.id,
          title: album.title,
          coverUrl: album.coverUrl
        },
        albumId: track.albumId || album.id
      }));
      
      audioPlayer.setQueue(tracksWithAlbum, 0);
    }
  };

  const playPlaylist = (playlist: any) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      // Enhance tracks with playlist information
      const tracksWithPlaylist = playlist.tracks.map((track: any) => ({
        ...track,
        playlistId: playlist.id
      }));
      
      audioPlayer.setQueue(tracksWithPlaylist, 0);
    }
  };

  const playArtistTracks = (artist: any) => {
    if (artist.tracks && artist.tracks.length > 0) {
      // Enhance tracks with artist information if not already present
      const tracksWithArtist = artist.tracks.map((track: any) => ({
        ...track,
        artist: track.artist || {
          id: artist.id,
          name: artist.name
        },
        artistId: track.artistId || artist.id
      }));
      
      audioPlayer.setQueue(tracksWithArtist, 0);
    }
  };

  const addToQueue = (tracks: any[]) => {
    audioPlayer.addToQueue(tracks);
  };

  return {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    togglePlay,
    seekTo,
    setVolume: setVolumeAndUpdate,
    playTrack,
    playNext,
    playPrevious,
    playAlbum,
    playPlaylist,
    playArtistTracks,
    addToQueue
  };
}
