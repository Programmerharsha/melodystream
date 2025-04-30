import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Playlist } from "@shared/schema";
import { useState } from "react";
import { Home, Search, Library, Plus, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Sidebar() {
  const [location] = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Fetch user playlists - using demo user (id=1)
  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ['/api/users/1/playlists'],
  });

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const createNewPlaylist = async () => {
    try {
      await apiRequest('POST', '/api/playlists', {
        userId: 1, // Demo user
        title: `New Playlist ${Math.floor(Math.random() * 1000)}`,
        description: "My new playlist"
      });
      // Invalidate playlists query to refresh the list
      // queryClient.invalidateQueries({ queryKey: ['/api/users/1/playlists'] });
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  // Mobile menu button
  const MobileMenuButton = () => (
    <button 
      className="lg:hidden fixed top-4 left-4 z-20 text-foreground text-xl p-2 rounded-full bg-card"
      onClick={toggleMobileMenu}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  // Sidebar content
  const SidebarContent = () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Rhythm</h1>
      <nav>
        <ul className="space-y-4">
          <li className="mb-2">
            <Link 
              href="/" 
              className={cn(
                "flex items-center space-x-4 py-2 group",
                location === "/" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Home className="w-6 h-6" />
              <span className="font-medium">Home</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/search" 
              className={cn(
                "flex items-center space-x-4 py-2 group",
                location === "/search" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="w-6 h-6" />
              <span className="font-medium">Search</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/library" 
              className={cn(
                "flex items-center space-x-4 py-2 group",
                location === "/library" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Library className="w-6 h-6" />
              <span className="font-medium">Your Library</span>
            </Link>
          </li>
          <li className="mb-2">
            <Link 
              href="/profile" 
              className={cn(
                "flex items-center space-x-4 py-2 group",
                location === "/profile" 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-6 h-6" />
              <span className="font-medium">Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-8">
        <h2 className="text-muted-foreground uppercase text-xs font-bold tracking-widest mb-4">Playlists</h2>
        <button 
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-4"
          onClick={createNewPlaylist}
        >
          <span className="h-6 w-6 bg-muted-foreground flex items-center justify-center text-black rounded">
            <Plus className="w-4 h-4" />
          </span>
          <span>Create Playlist</span>
        </button>
        <ul className="space-y-3">
          {playlists?.map((playlist) => (
            <li key={playlist.id}>
              <Link 
                href={`/playlist/${playlist.id}`} 
                className={cn(
                  "text-sm",
                  location === `/playlist/${playlist.id}` 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {playlist.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <MobileMenuButton />
      
      {/* Mobile sidebar (off-canvas) */}
      <div 
        className={cn(
          "lg:hidden fixed inset-0 bg-black/70 z-10 transform transition-transform",
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        )}
        onClick={() => setShowMobileMenu(false)}
      >
        <div 
          className="w-64 h-full bg-sidebar overflow-auto transform transition-transform"
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent />
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 bg-sidebar flex-shrink-0 flex-col overflow-auto">
        <SidebarContent />
      </div>
    </>
  );
}
