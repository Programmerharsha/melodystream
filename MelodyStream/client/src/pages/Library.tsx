import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/TopNavigation";
import AlbumCard from "@/components/AlbumCard";
import { Playlist, TrackWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { Plus, Music, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTrack } from "@/lib/trackContext";
import { formatTime } from "@/lib/formatTime";

export default function Library() {
  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ['/api/users/1/playlists'],
  });

  const { data: recentlyPlayed, isLoading: isLoadingRecentlyPlayed } = useQuery<TrackWithDetails[]>({
    queryKey: ['/api/users/1/recently-played'],
  });

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useTrack();

  const createNewPlaylist = async () => {
    try {
      await apiRequest('POST', '/api/playlists', {
        userId: 1, // Demo user
        title: `New Playlist ${Math.floor(Math.random() * 1000)}`,
        description: "My new playlist"
      });
      // Invalidate playlists query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/playlists'] });
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  if (isLoadingPlaylists || isLoadingRecentlyPlayed) {
    return (
      <div className="min-h-screen">
        <TopNavigation />
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  const handlePlayTrack = (track: TrackWithDetails) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <>
      <TopNavigation />
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Library</h1>
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={createNewPlaylist}
          >
            <Plus className="h-4 w-4" />
            <span>Create Playlist</span>
          </Button>
        </div>

        <Tabs defaultValue="playlists">
          <TabsList className="mb-6">
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="recent">Recently Played</TabsTrigger>
          </TabsList>
          
          <TabsContent value="playlists">
            {playlists && playlists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {playlists.map(playlist => (
                  <Link key={playlist.id} href={`/playlist/${playlist.id}`}>
                    <a className="bg-card p-4 rounded-md card-hover album-card relative">
                      <div className="relative mb-4">
                        <img 
                          src={playlist.imageUrl || 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600'}
                          alt={playlist.title} 
                          className="w-full aspect-square object-cover rounded-md shadow-lg" 
                        />
                      </div>
                      <h3 className="font-semibold truncate">{playlist.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {playlist.description || 'Your custom playlist'}
                      </p>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Create your first playlist</h2>
                <p className="text-muted-foreground mb-6">It's easy, we'll help you</p>
                <Button onClick={createNewPlaylist}>Create Playlist</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            {recentlyPlayed && recentlyPlayed.length > 0 ? (
              <div className="bg-card rounded-md overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-2 border-b border-muted text-sm font-medium text-muted-foreground">
                  <div className="col-span-6 md:col-span-5"># Title</div>
                  <div className="col-span-4 md:col-span-3 hidden md:block">Album</div>
                  <div className="col-span-2 hidden md:block">Artist</div>
                  <div className="col-span-2 md:col-span-2 flex justify-end items-center">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                
                {recentlyPlayed.map((track, index) => (
                  <div 
                    key={`${track.id}-${index}`} // Using index because the same track might appear multiple times
                    className="grid grid-cols-12 px-4 py-2 hover:bg-card/80 cursor-pointer items-center"
                    onClick={() => handlePlayTrack(track)}
                  >
                    <div className="col-span-6 md:col-span-5 flex items-center">
                      <div className="mr-3 text-muted-foreground w-5 text-right">{index + 1}</div>
                      <div className="flex-shrink-0 mr-3">
                        <img 
                          src={track.album.imageUrl} 
                          alt={track.title} 
                          className="h-10 w-10 object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate">{track.title}</div>
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-3 hidden md:block truncate">
                      <span className="text-muted-foreground hover:text-foreground truncate">{track.album.title}</span>
                    </div>
                    <div className="col-span-2 hidden md:block truncate">
                      <span className="text-muted-foreground hover:text-foreground truncate">{track.artist.name}</span>
                    </div>
                    <div className="col-span-2 md:col-span-2 flex justify-end text-muted-foreground">
                      {formatTime(track.duration)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No recently played tracks</h2>
                <p className="text-muted-foreground mb-6">Start listening to music to see your history</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
