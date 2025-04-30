import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import TopNavigation from "@/components/TopNavigation";
import { AlbumWithTracks, TrackWithDetails } from "@shared/schema";
import { 
  Play, 
  Pause, 
  Clock, 
  Heart,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/lib/formatTime";
import { useTrack } from "@/lib/trackContext";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export default function AlbumDetail() {
  const { id } = useParams();
  const albumId = parseInt(id, 10);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { data: album, isLoading } = useQuery<AlbumWithTracks>({
    queryKey: [`/api/albums/${albumId}`],
  });

  const { currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause } = useTrack();

  if (isLoading || !album) {
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
    if (album.tracks.length === 0) return;

    const trackToPlay = album.tracks[0];
    if (currentTrack?.id === trackToPlay.id && isPlaying) {
      pauseTrack();
    } else {
      const trackWithDetails: TrackWithDetails = {
        ...trackToPlay,
        artist: album.artist,
        album
      };
      playTrack(trackWithDetails);
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

  const totalDuration = album.tracks.reduce((sum, track) => sum + track.duration, 0);
  const minutes = Math.floor(totalDuration / 60);
  const formattedTotalDuration = `${minutes} min`;

  // Convert tracks to TrackWithDetails
  const tracksWithDetails: TrackWithDetails[] = album.tracks.map(track => ({
    ...track,
    artist: album.artist,
    album
  }));

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
                src={album.imageUrl} 
                alt={album.title}
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="text-sm font-medium uppercase mb-2">Album</div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{album.title}</h1>
              <div className="flex items-center gap-1 justify-center md:justify-start mb-2">
                <Link href={`/artist/${album.artist.id}`}>
                  <a className="font-medium hover:underline">{album.artist.name}</a>
                </Link>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{album.releaseYear}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {album.tracks.length} songs • {formattedTotalDuration}
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
            {(currentTrack?.album.id === album.id && isPlaying) ? (
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
        </div>

        <Separator className="my-2" />

        {/* Tracks */}
        <div className="px-4 md:px-8 pb-24">
          {album.tracks.length > 0 ? (
            <div className="bg-transparent rounded-md overflow-hidden">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-muted text-sm font-medium text-muted-foreground">
                <div className="col-span-1">#</div>
                <div className="col-span-9 md:col-span-10">Title</div>
                <div className="col-span-2 md:col-span-1 flex justify-end items-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              
              {tracksWithDetails.map((track, index) => (
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
                  <div className="col-span-9 md:col-span-10">
                    <div className={`font-medium ${currentTrack?.id === track.id ? "text-accent" : ""}`}>
                      {track.title}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end text-muted-foreground">
                    {formatTime(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-2">No tracks available</h2>
              <p className="text-muted-foreground">This album doesn't have any tracks yet</p>
            </div>
          )}
        </div>

        {/* Artist Bio */}
        {album.artist.bio && (
          <div className="px-4 md:px-8 pb-8">
            <h2 className="text-xl font-bold mb-4">About {album.artist.name}</h2>
            <p className="text-muted-foreground">{album.artist.bio}</p>
            <Link href={`/artist/${album.artist.id}`}>
              <a className="inline-block mt-4 text-accent hover:underline">View Artist</a>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
