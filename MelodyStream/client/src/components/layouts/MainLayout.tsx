import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Player } from "@/components/Player";
import { MobileNav } from "@/components/MobileNav";
import { useMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile unless toggled */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gradient-to-b from-purple-900/30 to-background">
          {/* Top Navigation */}
          <div className="sticky top-0 bg-background/80 backdrop-blur-md p-4 z-10 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <button 
                  onClick={toggleSidebar} 
                  className="text-foreground text-xl"
                >
                  <i className="fas fa-bars" />
                </button>
              )}
              
              {/* Navigation Arrows */}
              <div className="hidden lg:flex items-center space-x-4">
                <button className="bg-black/60 rounded-full h-8 w-8 flex items-center justify-center">
                  <i className="fas fa-chevron-left" />
                </button>
                <button className="bg-black/60 rounded-full h-8 w-8 flex items-center justify-center">
                  <i className="fas fa-chevron-right" />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative hidden lg:block lg:w-1/3 xl:w-1/4">
              <input 
                type="text" 
                placeholder="Search for songs, artists, albums..." 
                className="w-full bg-white/10 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-muted-foreground" />
            </div>
            
            {/* User Profile Menu */}
            <div className="flex items-center space-x-3">
              <button className="bg-black/30 text-sm py-1 px-4 rounded-full font-medium hidden lg:block">
                Upgrade
              </button>
              <button className="bg-black h-8 w-8 rounded-full flex items-center justify-center text-sm">
                <i className="fas fa-user" />
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-8 pb-32">
            {children}
          </div>
        </main>
      </div>

      {/* Player */}
      <Player />

      {/* Mobile Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
}
