import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, MoreHorizontal, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumCard } from "@/components/AlbumCard";
import { useAudioPlayer } from "@/hooks/use-audio-player";

export default function ArtistDetails() {
  const { id } = useParams();
  const [followed, setFollowed] = useState(false);
  
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playArtistTracks, 
    playTrack 
  } = useAudioPlayer();

  // Fetch artist data
  const { data: artist, isLoading: loadingArtist } = useQuery({
    queryKey: ["/api/artists", id],
  });

  // Fetch artist's albums
  const { data: albums, isLoading: loadingAlbums } = useQuery({
    queryKey: ["/api/artists", id, "albums"],
  });

  // Fetch artist's top tracks
  const { data: topTracks, isLoading: loadingTracks } = useQuery({
    queryKey: ["/api/artists", id, "top-tracks"],
  });

  // Fetch related artists
  const { data: relatedArtists, isLoading: loadingRelated } = useQuery({
    queryKey: ["/api/artists", id, "related"],
  });

  if (loadingArtist) {
    return (
      <div>
        <div className="flex items-start space-x-6 mb-8">
          <Skeleton className="h-48 w-48 rounded-full" />
          <div className="flex-1 space-y-4 py-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="space-y-2">
          {Array(5).fill(null).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!artist) {
    return <div>Artist not found</div>;
  }

  const isArtistPlaying = isPlaying && currentTrack?.artistId === artist.id;

  const toggleArtistPlay = () => {
    if (isArtistPlaying) {
      togglePlay();
    } else if (topTracks?.length > 0) {
      playArtistTracks({ ...artist, tracks: topTracks });
    }
  };

  const toggleFollow = () => {
    setFollowed(!followed);
  };

  return (
    <div>
      {/* Artist header */}
      <div className="h-80 bg-gradient-to-b from-muted/80 to-background relative flex items-end">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 p-8 flex items-center space-x-6">
          <img 
            src={artist.imageUrl} 
            alt={artist.name} 
            className="h-40 w-40 rounded-full shadow-lg object-cover"
          />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">{artist.name}</h1>
            <div className="flex space-x-4 mt-6">
              <Button 
                onClick={toggleArtistPlay}
                size="lg" 
                className="rounded-full px-8"
              >
                {isArtistPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                {isArtistPlaying ? "Pause" : "Play"}
              </Button>
              <Button 
                variant="outline" 
                onClick={toggleFollow}
                className={`rounded-full ${followed ? 'bg-transparent border-foreground' : 'bg-transparent border-foreground/60'}`}
              >
                {followed ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular songs */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Popular</h2>
        {loadingTracks ? (
          <div className="space-y-2">
            {Array(5).fill(null).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {topTracks?.slice(0, 5).map((track: any, index: number) => {
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
                        onClick={() => playTrack(track)}
                        className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <span className={`${isCurrentTrack ? 'hidden' : 'group-hover:hidden'}`}>{index + 1}</span>
                  </div>
                  <div className="flex items-center">
                    <img 
                      src={track.album?.coverUrl || ''} 
                      alt={track.album?.title} 
                      className="h-10 w-10 rounded mr-3 object-cover"
                    />
                    <div>
                      <div className={`font-medium ${isCurrentTrack ? 'text-primary' : ''}`}>{track.title}</div>
                      <div className="text-sm text-muted-foreground">{track.album?.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                      <Heart className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-muted-foreground mx-2">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Albums */}
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Albums</h2>
        {loadingAlbums ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-md">
                <div className="mb-4">
                  <Skeleton className="w-full aspect-square rounded-md" />
                </div>
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {albums?.map((album: any) => (
              <AlbumCard 
                key={album.id} 
                album={album} 
                variant="grid" 
                showArtist={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Related Artists */}
      {relatedArtists && relatedArtists.length > 0 && (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Fans also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {loadingRelated ? (
              Array(6).fill(null).map((_, i) => (
                <div key={i} className="bg-card p-4 rounded-md">
                  <div className="mb-4">
                    <Skeleton className="w-full aspect-square rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-full mb-2 mx-auto" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              ))
            ) : (
              relatedArtists.map((relatedArtist: any) => (
                <div key={relatedArtist.id} className="bg-card p-4 rounded-md card-hover album-card relative">
                  <div className="relative mb-4">
                    <img 
                      src={relatedArtist.imageUrl} 
                      alt={relatedArtist.name} 
                      className="w-full aspect-square object-cover rounded-full shadow-lg" 
                    />
                    <button className="absolute bottom-2 right-2 bg-primary rounded-full h-10 w-10 flex items-center justify-center shadow-lg play-icon">
                      <Play className="h-5 w-5 text-primary-foreground" />
                    </button>
                  </div>
                  <h3 className="font-semibold truncate text-center">{relatedArtist.name}</h3>
                  <p className="text-muted-foreground text-sm text-center">Artist</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
