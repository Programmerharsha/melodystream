import { useRef, useState, useEffect } from "react";
import { useTrack } from "@/lib/trackContext";
import { formatTime } from "@/lib/formatTime";
import { Heart, SkipBack, Play, Pause, SkipForward, Repeat, Shuffle, ListMusic, Volume2, Volume, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    togglePlayPause, 
    nextTrack, 
    prevTrack, 
    seekTo,
    setVolume
  } = useTrack();

  const progressBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    seekTo(newTime);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current) return;
    
    const rect = volumeBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    
    setVolume(Math.max(0, Math.min(1, percent)));
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const volumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  // Calculate progress percentage
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
  const volumePercentage = volume * 100;

  if (!currentTrack) return null;

  return (
    <div className="w-full h-20 lg:h-24 bg-black border-t border-gray-800 fixed bottom-0 left-0 right-0 z-50">
      <div className="h-1 w-full bg-gray-800 relative">
        <div 
          className="h-full bg-accent absolute left-0 top-0 player-progress" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="h-full flex items-center justify-between px-4">
        {/* Track Info */}
        <div className="flex items-center space-x-3 w-1/4">
          <img 
            src={currentTrack.album.imageUrl} 
            alt={currentTrack.title} 
            className="h-14 w-14 rounded-md hidden sm:block object-cover" 
          />
          <div className="overflow-hidden">
            <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
            <p className="text-muted-foreground text-xs truncate">{currentTrack.artist.name}</p>
          </div>
          <button 
            className={cn(
              "text-muted-foreground hover:text-foreground hidden lg:block",
              isFavorite && "text-accent"
            )}
            onClick={toggleFavorite}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        
        {/* Player Controls */}
        <div className="flex flex-col items-center justify-center w-2/4">
          <div className="flex items-center justify-center space-x-4 mb-1">
            <button 
              className={cn(
                "text-muted-foreground hover:text-foreground hidden sm:block",
                isShuffle && "text-accent"
              )}
              onClick={toggleShuffle}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button 
              className="text-foreground text-lg"
              onClick={prevTrack}
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button 
              className="bg-foreground rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center text-black"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button 
              className="text-foreground text-lg"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button 
              className={cn(
                "text-muted-foreground hover:text-foreground hidden sm:block",
                isRepeat && "text-accent"
              )}
              onClick={toggleRepeat}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>
          <div className="w-full max-w-md hidden sm:flex items-center space-x-2 text-xs">
            <span className="text-muted-foreground">{formatTime(currentTime)}</span>
            <div 
              className="h-1 flex-1 bg-muted/30 rounded-full relative cursor-pointer"
              ref={progressBarRef}
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-muted-foreground rounded-full absolute"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Volume Controls */}
        <div className="items-center space-x-2 hidden lg:flex w-1/4 justify-end">
          <button className="text-muted-foreground hover:text-foreground">
            <ListMusic className="h-4 w-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            {volumeIcon()}
          </button>
          <div 
            className="w-24 h-1 bg-muted/30 rounded-full relative cursor-pointer"
            ref={volumeBarRef}
            onClick={handleVolumeClick}
          >
            <div 
              className="h-full bg-muted-foreground rounded-full absolute"
              style={{ width: `${volumePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
