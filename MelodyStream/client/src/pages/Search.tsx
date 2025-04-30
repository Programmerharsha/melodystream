import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import TopNavigation from "@/components/TopNavigation";
import AlbumCard from "@/components/AlbumCard";
import ArtistCard from "@/components/ArtistCard";
import { Album, Artist, TrackWithDetails } from "@shared/schema";
import { useTrack } from "@/lib/trackContext";
import { Play, Pause, Search as SearchIcon } from "lucide-react";
import { formatTime } from "@/lib/formatTime";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location] = useLocation();
  const { currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause } = useTrack();

  // Extract query from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [location]);

  // Search results query
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: searchQuery.length > 0,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePlayTrack = (track: TrackWithDetails) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <>
      <TopNavigation onSearch={handleSearch} showSearch={true} />
      <div className="p-4 md:p-8">
        {searchQuery ? (
          isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6">Search results for "{searchQuery}"</h1>
              
              <Tabs defaultValue="all">
                <TabsList className="mb-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="songs">Songs</TabsTrigger>
                  <TabsTrigger value="albums">Albums</TabsTrigger>
                  <TabsTrigger value="artists">Artists</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {/* Top Results */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Songs Section */}
                    {searchResults?.tracks && searchResults.tracks.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Songs</h2>
                        <div className="bg-card rounded-md overflow-hidden">
                          {searchResults.tracks.slice(0, 5).map((track: TrackWithDetails) => (
                            <div 
                              key={track.id}
                              className="flex items-center px-4 py-2 hover:bg-card/80 cursor-pointer"
                              onClick={() => handlePlayTrack(track)}
                            >
                              <div className="flex-shrink-0 mr-4">
                                <img 
                                  src={track.album.imageUrl} 
                                  alt={track.title} 
                                  className="h-10 w-10 object-cover"
                                />
                              </div>
                              <div className="flex-grow mr-4">
                                <div className="font-medium text-foreground">{track.title}</div>
                                <div className="text-sm text-muted-foreground">{track.artist.name}</div>
                              </div>
                              <div className="flex items-center">
                                <button className="p-2 rounded-full bg-transparent hover:bg-black/20">
                                  {currentTrack?.id === track.id && isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </button>
                                <div className="ml-4 text-sm text-muted-foreground">
                                  {formatTime(track.duration)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Albums Section */}
                    {searchResults?.albums && searchResults.albums.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4">Albums</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {searchResults.albums.slice(0, 4).map((album: Album) => (
                            <AlbumCard key={album.id} album={album} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Artists Section */}
                  {searchResults?.artists && searchResults.artists.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-4">Artists</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {searchResults.artists.slice(0, 6).map((artist: Artist) => (
                          <ArtistCard key={artist.id} artist={artist} />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="songs">
                  {searchResults?.tracks && searchResults.tracks.length > 0 ? (
                    <div className="bg-card rounded-md overflow-hidden">
                      {searchResults.tracks.map((track: TrackWithDetails) => (
                        <div 
                          key={track.id}
                          className="flex items-center px-4 py-2 hover:bg-card/80 cursor-pointer"
                          onClick={() => handlePlayTrack(track)}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <img 
                              src={track.album.imageUrl} 
                              alt={track.title} 
                              className="h-10 w-10 object-cover"
                            />
                          </div>
                          <div className="flex-grow mr-4">
                            <div className="font-medium text-foreground">{track.title}</div>
                            <div className="text-sm text-muted-foreground">{track.artist.name}</div>
                          </div>
                          <div className="flex items-center">
                            <button className="p-2 rounded-full bg-transparent hover:bg-black/20">
                              {currentTrack?.id === track.id && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                            <div className="ml-4 text-sm text-muted-foreground">
                              {formatTime(track.duration)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No songs found matching your search.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="albums">
                  {searchResults?.albums && searchResults.albums.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                      {searchResults.albums.map((album: Album) => (
                        <AlbumCard key={album.id} album={album} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No albums found matching your search.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="artists">
                  {searchResults?.artists && searchResults.artists.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                      {searchResults.artists.map((artist: Artist) => (
                        <ArtistCard key={artist.id} artist={artist} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No artists found matching your search.</p>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <SearchIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Search for music</h1>
            <p className="text-muted-foreground">Find your favorite songs, artists, albums and more</p>
          </div>
        )}
      </div>
    </>
  );
}
