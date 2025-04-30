import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import MobileNavigation from "@/components/MobileNavigation";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Library from "@/pages/Library";
import Profile from "@/pages/Profile";
import PlaylistDetail from "@/pages/PlaylistDetail";
import AlbumDetail from "@/pages/AlbumDetail";
import ArtistDetail from "@/pages/ArtistDetail";
import { TrackProvider, useTrack } from "@/lib/trackContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/search" component={Search}/>
      <Route path="/library" component={Library}/>
      <Route path="/profile" component={Profile}/>
      <Route path="/playlist/:id" component={PlaylistDetail}/>
      <Route path="/album/:id" component={AlbumDetail}/>
      <Route path="/artist/:id" component={ArtistDetail}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { currentTrack } = useTrack();
  const showPlayer = !!currentTrack;

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <Sidebar />
      
      <main className="flex-1 overflow-auto bg-gradient-to-b from-purple-900/30 to-background content-area pb-24 lg:pb-24">
        <Router />
      </main>
      
      {showPlayer && <Player />}
      {showPlayer && <MobileNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TrackProvider>
          <AppContent />
          <Toaster />
        </TrackProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
