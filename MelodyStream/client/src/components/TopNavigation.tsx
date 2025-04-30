import { useLocation } from "wouter";
import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopNavigationProps {
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export default function TopNavigation({ onSearch, showSearch = false }: TopNavigationProps) {
  const [location, navigate] = useLocation();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchValue.trim()) {
      onSearch(searchValue);
    } else if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoForward = () => {
    window.history.forward();
  };

  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-md p-4 z-10 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/60 rounded-full h-8 w-8 flex items-center justify-center"
            onClick={handleGoBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/60 rounded-full h-8 w-8 flex items-center justify-center"
            onClick={handleGoForward}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="relative w-1/3 xl:w-1/4">
          <Input
            type="text"
            placeholder="Search for songs, artists, albums..."
            className="w-full bg-white/10 rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </form>
      )}

      <div className="flex items-center space-x-3">
        <Button variant="ghost" className="bg-black/30 text-sm py-1 px-4 rounded-full font-medium hidden lg:block">
          Upgrade
        </Button>
        <Button variant="ghost" size="icon" className="bg-black h-8 w-8 rounded-full">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
