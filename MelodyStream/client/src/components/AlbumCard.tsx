import { useState } from "react";
import { Link } from "wouter";
import { Album } from "@shared/schema";
import { Play, Pause } from "lucide-react";
import { useTrack } from "@/lib/trackContext";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface AlbumCardProps {
  album: Album;
  className?: string;
}

export default function AlbumCard({ album, className }: AlbumCardProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useTrack();
  const [isHovered, setIsHovered] = useState(false);

  // Fetch album details to get the tracks
  const { data: albumWithTracks } = useQuery({
    queryKey: [`/api/albums/${album.id}`],
    enabled: isHovered, // Only fetch when hovered
  });

  const isCurrentAlbum = currentTrack?.album.id === album.id;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!albumWithTracks) return;

    if (isCurrentAlbum && isPlaying) {
      pauseTrack();
    } else if (albumWithTracks?.tracks?.length) {
      playTrack({
        ...albumWithTracks.tracks[0],
        artist: albumWithTracks.artist,
        album: albumWithTracks
      });
    }
  };

  return (
    <div 
      className={cn(
        "bg-card p-4 rounded-md card-hover album-card relative",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/album/${album.id}`}>
        <a className="block">
          <div className="relative mb-4">
            <img 
              src={album.imageUrl} 
              alt={album.title} 
              className="w-full aspect-square object-cover rounded-md shadow-lg" 
            />
            <button 
              className="absolute bottom-2 right-2 bg-accent rounded-full h-10 w-10 flex items-center justify-center shadow-lg play-icon"
              onClick={handlePlayPause}
            >
              {(isCurrentAlbum && isPlaying) ? (
                <Pause className="h-5 w-5 text-primary-foreground" />
              ) : (
                <Play className="h-5 w-5 text-primary-foreground" />
              )}
            </button>
          </div>
          <h3 className="font-semibold truncate">{album.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            Album • {albumWithTracks?.artist?.name || "Loading..."}
          </p>
        </a>
      </Link>
    </div>
  );
}
