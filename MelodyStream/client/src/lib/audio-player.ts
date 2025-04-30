// AudioPlayer class to handle audio playback
class AudioPlayer {
  private audio: HTMLAudioElement;
  private _currentTrack: any = null;
  private _isPlaying: boolean = false;
  private _volume: number = 0.7;
  private _currentTime: number = 0;
  private _duration: number = 0;
  private _queue: any[] = [];
  private _previousTracks: any[] = [];
  private _listeners: Set<() => void> = new Set();

  constructor() {
    this.audio = new Audio();
    
    // Set up event listeners
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('ended', this.handleTrackEnd);
    this.audio.addEventListener('loadedmetadata', this.handleMetadataLoaded);
    this.audio.addEventListener('play', () => this.notifyListeners());
    this.audio.addEventListener('pause', () => this.notifyListeners());
    this.audio.volume = this._volume;
  }

  // Private methods for event handling
  private handleTimeUpdate = () => {
    this._currentTime = this.audio.currentTime;
    this.notifyListeners();
  };

  private handleTrackEnd = () => {
    this.playNext();
  };

  private handleMetadataLoaded = () => {
    this._duration = this.audio.duration;
    this.notifyListeners();
  };

  private notifyListeners() {
    this._listeners.forEach(listener => listener());
  }

  // Public methods for controlling playback
  subscribe(callback: () => void) {
    this._listeners.add(callback);
    return () => {
      this._listeners.delete(callback);
    };
  }

  async loadTrack(track: any) {
    this._currentTrack = track;
    
    if (track && track.audioUrl) {
      this.audio.src = track.audioUrl;
      this.audio.load();
      this._currentTime = 0;
    }
    
    this.notifyListeners();
  }

  async play() {
    if (this.audio.src) {
      try {
        await this.audio.play();
        this._isPlaying = true;
        this.notifyListeners();
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  }

  pause() {
    this.audio.pause();
    this._isPlaying = false;
    this.notifyListeners();
  }

  togglePlay() {
    if (this._isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seekTo(time: number) {
    if (this.audio.src) {
      this.audio.currentTime = time;
      this._currentTime = time;
      this.notifyListeners();
    }
  }

  setVolume(volume: number) {
    this._volume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this._volume;
    this.notifyListeners();
  }

  addToQueue(tracks: any[]) {
    this._queue = [...this._queue, ...tracks];
    this.notifyListeners();
  }

  setQueue(tracks: any[], startIndex: number = 0) {
    // Add current track to previous tracks if it exists
    if (this._currentTrack) {
      this._previousTracks.push(this._currentTrack);
    }
    
    // Set the queue to the remaining tracks (after startIndex)
    this._queue = tracks.slice(startIndex + 1);
    
    // Load and play the first track
    const trackToPlay = tracks[startIndex];
    if (trackToPlay) {
      this.loadTrack(trackToPlay);
      this.play();
    }
  }

  playNext() {
    if (this._queue.length > 0) {
      // Add current track to previous tracks if it exists
      if (this._currentTrack) {
        this._previousTracks.push(this._currentTrack);
      }
      
      // Get next track from queue
      const nextTrack = this._queue.shift();
      this.loadTrack(nextTrack);
      this.play();
    } else {
      // No more tracks, just stop
      this.pause();
      this.seekTo(0);
    }
  }

  playPrevious() {
    if (this._currentTime > 3) {
      // If we're more than 3 seconds into the track, restart it
      this.seekTo(0);
    } else if (this._previousTracks.length > 0) {
      // Add current track to the beginning of the queue
      if (this._currentTrack) {
        this._queue.unshift(this._currentTrack);
      }
      
      // Get previous track
      const previousTrack = this._previousTracks.pop();
      this.loadTrack(previousTrack);
      this.play();
    } else {
      // No previous tracks, restart current track
      this.seekTo(0);
    }
  }

  // Getters
  get currentTrack() {
    return this._currentTrack;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  get volume() {
    return this._volume;
  }

  get currentTime() {
    return this._currentTime;
  }

  get duration() {
    return this._duration;
  }

  get queue() {
    return [...this._queue];
  }
}

// Export a singleton instance
export const audioPlayer = new AudioPlayer();
