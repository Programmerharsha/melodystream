import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import TopNavigation from "@/components/TopNavigation";
import AlbumCard from "@/components/AlbumCard";
import { Artist, Album, TrackWithDetails } from "@shared/schema";
import { 
  Play, 
  Pause, 
  Heart,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrack } from "@/lib/trackContext";
import { useState } from "react";

export default function ArtistDetail() {
  const { id } = useParams();
  const artistId = parseInt(id, 10);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Fetch artist details
  const { data: artist, isLoading: isLoadingArtist } = useQuery<Artist>({
    queryKey: [`/api/artists/${artistId}`],
  });

  // Fetch artist's albums
  const { data: albums, isLoading: isLoadingAlbums } = useQuery<Album[]>({
    queryKey: [`/api/artists/${artistId}/albums`],
  });

  // For the first album, fetch its tracks to play when clicking the Play button
  const { data: firstAlbumWithTracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: albums && albums.length > 0 ? [`/api/albums/${albums[0].id}`] : null,
    enabled: !!(albums && albums.length > 0),
  });

  const { currentTrack, isPlaying, playTrack, pauseTrack } = useTrack();

  if (isLoadingArtist || isLoadingAlbums || (albums && albums.length > 0 && isLoadingTracks)) {
    return (
      <div className="min-h-screen">
        <TopNavigation />
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen">
        <TopNavigation />
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Artist not found</h1>
          <p className="text-muted-foreground">The artist you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (!firstAlbumWithTracks || !firstAlbumWithTracks.tracks || firstAlbumWithTracks.tracks.length === 0) {
      return;
    }

    const trackToPlay = firstAlbumWithTracks.tracks[0];
    const isCurrentArtistPlaying = 
      currentTrack?.artist.id === artist.id && isPlaying;

    if (isCurrentArtistPlaying) {
      pauseTrack();
    } else {
      const trackWithDetails: TrackWithDetails = {
        ...trackToPlay,
        artist: firstAlbumWithTracks.artist,
        album: firstAlbumWithTracks
      };
      playTrack(trackWithDetails);
    }
  };

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <>
      <TopNavigation />
      <div>
        {/* Artist Header */}
        <div className="relative h-80 md:h-96">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 to-background z-0"></div>
          <div 
            className="absolute inset-0 bg-center bg-cover blur-sm opacity-30"
            style={{ backgroundImage: `url(${artist.imageUrl})` }}
          ></div>
          <div className="relative h-full flex flex-col justify-end p-4 md:p-8 z-10">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{artist.name}</h1>
              <div className="text-sm text-muted-foreground mb-6">
                {albums?.length || 0} Albums • Monthly Listeners: 8.5M
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 md:px-8 py-4 flex items-center gap-4">
          <Button 
            className="h-14 w-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={handlePlayPause}
            disabled={!firstAlbumWithTracks || !firstAlbumWithTracks.tracks}
          >
            {currentTrack?.artist.id === artist.id && isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          
          <Button 
            variant={isFollowing ? "default" : "outline"}
            onClick={toggleFollow}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
          >
            <Heart className="h-6 w-6" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Share2 className="h-6 w-6" />
          </Button>
        </div>

        {/* Popular Tracks Section */}
        {firstAlbumWithTracks && firstAlbumWithTracks.tracks && (
          <section className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold mb-4">Popular</h2>
            <div className="space-y-2">
              {firstAlbumWithTracks.tracks.slice(0, 5).map((track, index) => {
                const trackWithDetails: TrackWithDetails = {
                  ...track,
                  artist: firstAlbumWithTracks.artist,
                  album: firstAlbumWithTracks
                };
                
                return (
                  <div 
                    key={track.id}
                    className="flex items-center p-2 hover:bg-card/40 rounded-md cursor-pointer"
                    onClick={() => playTrack(trackWithDetails)}
                  >
                    <div className="w-6 text-center text-muted-foreground mr-4">{index + 1}</div>
                    <div className="h-10 w-10 mr-4">
                      <img 
                        src={firstAlbumWithTracks.imageUrl} 
                        alt={track.title}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{track.title}</div>
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Albums Section */}
        {albums && albums.length > 0 && (
          <section className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {albums.map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {/* Artist Bio */}
        {artist.bio && (
          <section className="px-4 md:px-8 py-6">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <div className="bg-card/40 p-6 rounded-lg">
              <p className="text-muted-foreground">{artist.bio}</p>
            </div>
          </section>
        )}

        {/* Similar Artists Section - mockup only */}
        <section className="px-4 md:px-8 py-6 mb-20">
          <h2 className="text-2xl font-bold mb-4">Fans also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {/* This would be populated with real data in a full implementation */}
            <div className="flex flex-col items-center">
              <div className="h-40 w-40 rounded-full overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1501836897392-78de1e6a97a9?w=600" 
                  alt="Similar Artist"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="font-medium">Similar Artist</div>
              <div className="text-sm text-muted-foreground">Artist</div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
