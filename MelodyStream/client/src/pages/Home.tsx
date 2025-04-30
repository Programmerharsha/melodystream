import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/TopNavigation";
import AlbumCard from "@/components/AlbumCard";
import ArtistCard from "@/components/ArtistCard";
import { Album, Artist, TrackWithDetails, Playlist } from "@shared/schema";
import { useTrack } from "@/lib/trackContext";
import { Play } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { playTrack } = useTrack();

  // Fetch data for different sections
  const { data: albums, isLoading: isLoadingAlbums } = useQuery<Album[]>({
    queryKey: ['/api/albums'],
  });

  const { data: artists, isLoading: isLoadingArtists } = useQuery<Artist[]>({
    queryKey: ['/api/artists'],
  });

  const { data: tracks, isLoading: isLoadingTracks } = useQuery<TrackWithDetails[]>({
    queryKey: ['/api/tracks'],
  });

  const { data: recentlyPlayed, isLoading: isLoadingRecentlyPlayed } = useQuery<TrackWithDetails[]>({
    queryKey: ['/api/users/1/recently-played'],
  });

  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ['/api/users/1/playlists'],
  });

  // Function to play a track when clicked
  const handlePlayTrack = (track: TrackWithDetails) => {
    playTrack(track);
  };

  // Loading state
  if (isLoadingAlbums || isLoadingArtists || isLoadingTracks || isLoadingRecentlyPlayed || isLoadingPlaylists) {
    return (
      <div className="min-h-screen">
        <TopNavigation />
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNavigation />
      <div className="p-4 md:p-8">
        {/* Hero Section */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold mb-6">Good afternoon</h1>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists?.slice(0, 6).map((playlist) => (
              <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                <a className="bg-card/40 flex items-center rounded overflow-hidden h-16 card-hover">
                  <img 
                    src={playlist.imageUrl || 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600'}
                    alt={playlist.title} 
                    className="h-16 w-16 object-cover" 
                  />
                  <span className="px-4 font-medium truncate">{playlist.title}</span>
                </a>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Made for you</h2>
            <Link href="/search">
              <a className="text-muted-foreground text-sm font-bold hover:underline">See all</a>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {albums?.slice(0, 6).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>

        {/* Recently Played Section */}
        {recentlyPlayed && recentlyPlayed.length > 0 && (
          <section className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recently played</h2>
              <Link href="/library">
                <a className="text-muted-foreground text-sm font-bold hover:underline">See all</a>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {recentlyPlayed.slice(0, 6).map((track) => (
                <div 
                  key={track.id}
                  className="bg-card p-4 rounded-md card-hover album-card relative"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="relative mb-4">
                    <img 
                      src={track.album.imageUrl}
                      alt={track.title} 
                      className="w-full aspect-square object-cover rounded-md shadow-lg" 
                    />
                    <button className="absolute bottom-2 right-2 bg-accent rounded-full h-10 w-10 flex items-center justify-center shadow-lg play-icon">
                      <Play className="h-5 w-5 text-primary-foreground" />
                    </button>
                  </div>
                  <h3 className="font-semibold truncate">{track.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    Song • {track.artist.name}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Artists Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Popular artists</h2>
            <Link href="/search?filter=artists">
              <a className="text-muted-foreground text-sm font-bold hover:underline">See all</a>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {artists?.slice(0, 6).map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
