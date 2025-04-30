import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Search, Library, User } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-20 left-0 right-0 bg-black py-2 px-4 border-t border-gray-800 z-40">
      <div className="flex justify-between items-center">
        <Link href="/">
          <a className={cn(
            "flex flex-col items-center",
            location === "/" ? "text-foreground" : "text-muted-foreground"
          )}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/search">
          <a className={cn(
            "flex flex-col items-center",
            location === "/search" ? "text-foreground" : "text-muted-foreground"
          )}>
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </a>
        </Link>
        
        <Link href="/library">
          <a className={cn(
            "flex flex-col items-center",
            location === "/library" ? "text-foreground" : "text-muted-foreground"
          )}>
            <Library className="h-5 w-5" />
            <span className="text-xs mt-1">Library</span>
          </a>
        </Link>
        
        <Link href="/profile">
          <a className={cn(
            "flex flex-col items-center",
            location === "/profile" ? "text-foreground" : "text-muted-foreground"
          )}>
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
