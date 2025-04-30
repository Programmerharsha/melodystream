import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import TopNavigation from "@/components/TopNavigation";
import { PlaylistWithTracks, TrackWithDetails } from "@shared/schema";
import { 
  Play, 
  Pause, 
  Clock, 
  MoreHorizontal,
  Heart,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/formatTime";
import { useTrack } from "@/lib/trackContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function PlaylistDetail() {
  const { id } = useParams();
  const playlistId = parseInt(id, 10);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { data: playlist, isLoading } = useQuery<PlaylistWithTracks>({
    queryKey: [`/api/playlists/${playlistId}`],
  });

  const { currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause } = useTrack();

  if (isLoading || !playlist) {
    return (
      <div className="min-h-screen">
        <TopNavigation />
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (playlist.tracks.length === 0) return;

    if (currentTrack?.id === playlist.tracks[0].id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(playlist.tracks[0]);
    }
  };

  const handlePlayTrack = (track: TrackWithDetails) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const deletePlaylist = async () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      try {
        await apiRequest('DELETE', `/api/playlists/${playlistId}`);
        queryClient.invalidateQueries({ queryKey: ['/api/users/1/playlists'] });
        window.history.back();
      } catch (error) {
        console.error('Failed to delete playlist:', error);
      }
    }
  };

  const totalDuration = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const formattedTotalDuration = hours > 0 
    ? `${hours} hr ${minutes} min` 
    : `${minutes} min`;

  return (
    <>
      <TopNavigation />
      <div>
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-background"></div>
          <div className="relative p-4 md:p-8 pt-8 md:pt-16 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            <div className="w-48 h-48 md:w-56 md:h-56 shadow-xl">
              <img 
                src={playlist.imageUrl || 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600'} 
                alt={playlist.title}
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="text-sm font-medium uppercase mb-2">Playlist</div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{playlist.title}</h1>
              <p className="text-muted-foreground mb-2 text-sm">
                {playlist.description || 'No description'}
              </p>
              <div className="text-sm text-muted-foreground">
                {playlist.tracks.length} songs • {formattedTotalDuration}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 md:px-8 py-4 flex items-center gap-4">
          <Button 
            className="h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handlePlayPause}
          >
            {(currentTrack?.id === playlist.tracks[0]?.id && isPlaying) ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleFavorite}
          >
            <Heart className="h-6 w-6" fill={isFavorite ? "currentColor" : "none"} />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Share2 className="h-6 w-6" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={deletePlaylist}>
                Delete Playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator className="my-2" />

        {/* Tracks */}
        <div className="px-4 md:px-8 pb-24">
          {playlist.tracks.length > 0 ? (
            <div className="bg-transparent rounded-md overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-muted text-sm font-medium text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-5 md:col-span-5">Title</div>
                <div className="col-span-4 md:col-span-3 hidden md:block">Album</div>
                <div className="col-span-2 hidden md:block">Artist</div>
                <div className="col-span-2 md:col-span-1 flex justify-end items-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              
              {playlist.tracks.map((track, index) => (
                <div 
                  key={track.id}
                  className="grid grid-cols-12 px-4 py-2 hover:bg-card/40 rounded-md cursor-pointer items-center"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="col-span-1 flex justify-center text-muted-foreground">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="h-4 w-4 text-accent" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="col-span-5 md:col-span-5 flex items-center">
                    <div className="flex-shrink-0 mr-3">
                      <img 
                        src={track.album.imageUrl} 
                        alt={track.title} 
                        className="h-10 w-10 object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <div className={`font-medium truncate ${currentTrack?.id === track.id ? "text-accent" : ""}`}>
                        {track.title}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-3 hidden md:block truncate">
                    <span className="text-muted-foreground hover:text-foreground truncate">{track.album.title}</span>
                  </div>
                  <div className="col-span-2 hidden md:block truncate">
                    <span className="text-muted-foreground hover:text-foreground truncate">{track.artist.name}</span>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end text-muted-foreground">
                    {formatTime(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-2">This playlist is empty</h2>
              <p className="text-muted-foreground">Add some tracks to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
