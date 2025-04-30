import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, MoreHorizontal, Heart, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudioPlayer } from "@/hooks/use-audio-player";

export default function AlbumDetails() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playTrack, 
    playAlbum 
  } = useAudioPlayer();

  const { data: album, isLoading } = useQuery({
    queryKey: ["/api/albums", id],
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex items-start space-x-6 mb-8">
          <Skeleton className="h-48 w-48 rounded-md" />
          <div className="flex-1 space-y-4 py-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {Array(10).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return <div>Album not found</div>;
  }

  const isAlbumPlaying = isPlaying && currentTrack?.albumId === album.id;

  const toggleAlbumPlay = () => {
    if (isAlbumPlaying) {
      togglePlay();
    } else {
      playAlbum(album);
    }
  };

  const handleTrackPlay = (track: any) => {
    playTrack(track);
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {/* Album header */}
      <div className="flex flex-col md:flex-row items-start md:space-x-6 mb-8">
        <img 
          src={album.coverUrl} 
          alt={album.title} 
          className="h-48 w-48 rounded-md shadow-lg object-cover"
        />
        <div className="flex-1 mt-4 md:mt-0">
          <p className="text-sm uppercase font-medium">Album</p>
          <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">{album.title}</h1>
          <p className="text-muted-foreground">
            <span className="font-medium">{album.artist?.name}</span>
            {album.releaseYear && <span> • {album.releaseYear}</span>}
            {album.tracks && <span> • {album.tracks.length} songs</span>}
          </p>
          <div className="flex space-x-4 mt-6">
            <Button 
              onClick={toggleAlbumPlay}
              size="lg" 
              className="rounded-full px-8"
            >
              {isAlbumPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
              {isAlbumPlaying ? "Pause" : "Play"}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleSave}
              className={`rounded-full ${isSaved ? 'text-primary' : ''}`}
            >
              <Heart className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tracks list */}
      <div className="mt-8">
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b border-muted text-sm text-muted-foreground">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div className="divide-y divide-muted/30">
          {album.tracks?.map((track: any, index: number) => {
            const isCurrentTrack = currentTrack?.id === track.id;
            
            return (
              <div 
                key={track.id}
                className={`grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 hover:bg-muted/30 ${isCurrentTrack ? 'bg-muted/30' : ''} rounded-md transition-colors group`}
              >
                <div className="w-8 flex items-center justify-center text-sm">
                  {isCurrentTrack && isPlaying ? (
                    <div className="w-4 h-4 flex items-center justify-center text-primary">
                      <span className="sr-only">Now playing</span>
                      <svg viewBox="0 0 24 24" className="h-4 w-4">
                        <rect x="5" y="4" width="4" height="16" fill="currentColor">
                          <animate attributeName="height" values="16;8;16" dur="1s" repeatCount="indefinite" />
                        </rect>
                        <rect x="15" y="4" width="4" height="16" fill="currentColor">
                          <animate attributeName="height" values="8;16;8" dur="1s" repeatCount="indefinite" />
                        </rect>
                      </svg>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleTrackPlay(track)}
                      className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  <span className={`${isCurrentTrack ? 'hidden' : 'group-hover:hidden'}`}>{index + 1}</span>
                </div>
                <div className="flex items-center">
                  <div>
                    <div className={`font-medium ${isCurrentTrack ? 'text-primary' : ''}`}>{track.title}</div>
                    <div className="text-sm text-muted-foreground">{track.artist?.name || album.artist?.name}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(track.duration)}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
