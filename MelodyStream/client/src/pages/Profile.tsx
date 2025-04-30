import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/TopNavigation";
import { User, Playlist, TrackWithDetails } from "@shared/schema";
import { Link } from "wouter";
import { 
  User as UserIcon, 
  Music, 
  Clock, 
  Settings, 
  LogOut,
  Heart,
  Calendar,
  Mail,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTime } from "@/lib/formatTime";
import { useTrack } from "@/lib/trackContext";

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  
  // Fetch user data - using demo user (id=1)
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/users/1'],
  });

  // Fetch user playlists
  const { data: playlists, isLoading: isLoadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ['/api/users/1/playlists'],
  });

  // Fetch recently played
  const { data: recentlyPlayed, isLoading: isLoadingRecentlyPlayed } = useQuery<TrackWithDetails[]>({
    queryKey: ['/api/users/1/recently-played'],
  });

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useTrack();

  if (isLoadingUser || isLoadingPlaylists || isLoadingRecentlyPlayed) {
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
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
          <div className="relative">
            <Avatar className="h-40 w-40 border-4 border-background">
              <AvatarImage src={user?.avatarUrl || "https://i.pravatar.cc/300"} alt={user?.displayName || "User"} />
              <AvatarFallback className="text-4xl">{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute bottom-2 right-2 bg-background/50 backdrop-blur-sm hover:bg-background/70"
              onClick={() => setEditMode(!editMode)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center md:text-left">
            <div className="text-sm font-medium text-muted-foreground mb-2">Profile</div>
            <h1 className="text-4xl font-bold mb-4">{user?.displayName || user?.username || "User"}</h1>
            
            <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Music className="h-4 w-4" />
                <span>{playlists?.length || 0} Playlists</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span>0 Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Joined 2023</span>
              </div>
              {user?.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Edit Profile
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" className="text-muted-foreground">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="playlists">
          <TabsList className="mb-6">
            <TabsTrigger value="playlists">Your Playlists</TabsTrigger>
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
                <h2 className="text-xl font-semibold mb-2">No playlists yet</h2>
                <p className="text-muted-foreground mb-6">Create your first playlist to get started</p>
                <Button>Create Playlist</Button>
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
                    key={`${track.id}-${index}`}
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
