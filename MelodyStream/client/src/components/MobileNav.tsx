import { useLocation, Link } from "wouter";
import { Home, Search, Library, User } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="lg:hidden fixed bottom-20 left-0 right-0 bg-black py-2 px-4 border-t border-gray-800 z-40">
      <div className="flex justify-between items-center">
        <Link href="/">
          <a className={`flex flex-col items-center ${location === "/" ? "text-foreground" : "text-muted-foreground"}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/search">
          <a className={`flex flex-col items-center ${location === "/search" ? "text-foreground" : "text-muted-foreground"}`}>
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </a>
        </Link>
        <Link href="/library">
          <a className={`flex flex-col items-center ${location === "/library" ? "text-foreground" : "text-muted-foreground"}`}>
            <Library className="h-5 w-5" />
            <span className="text-xs mt-1">Library</span>
          </a>
        </Link>
        <a href="#" className="flex flex-col items-center text-muted-foreground">
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </a>
      </div>
    </div>
  );
}
