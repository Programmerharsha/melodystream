import { useState } from "react";
import { Link } from "wouter";
import { Artist } from "@shared/schema";
import { Play, Pause } from "lucide-react";
import { useTrack } from "@/lib/trackContext";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface ArtistCardProps {
  artist: Artist;
  className?: string;
}

export default function ArtistCard({ artist, className }: ArtistCardProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useTrack();
  const [isHovered, setIsHovered] = useState(false);

  // Fetch artist's albums to get tracks to play
  const { data: albums } = useQuery({
    queryKey: [`/api/artists/${artist.id}/albums`],
    enabled: isHovered, // Only fetch when hovered
  });

  // If we have albums, fetch the first album's details to get tracks
  const { data: firstAlbum } = useQuery({
    queryKey: albums && albums.length > 0 ? [`/api/albums/${albums[0].id}`] : null,
    enabled: !!(albums && albums.length > 0),
  });

  const isCurrentArtist = currentTrack?.artist.id === artist.id;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firstAlbum) return;

    if (isCurrentArtist && isPlaying) {
      pauseTrack();
    } else if (firstAlbum?.tracks?.length) {
      playTrack({
        ...firstAlbum.tracks[0],
        artist: firstAlbum.artist,
        album: firstAlbum
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
      <Link href={`/artist/${artist.id}`}>
        <a className="block">
          <div className="relative mb-4">
            <img 
              src={artist.imageUrl} 
              alt={artist.name} 
              className="w-full aspect-square object-cover rounded-full shadow-lg" 
            />
            <button 
              className="absolute bottom-2 right-2 bg-accent rounded-full h-10 w-10 flex items-center justify-center shadow-lg play-icon"
              onClick={handlePlayPause}
            >
              {(isCurrentArtist && isPlaying) ? (
                <Pause className="h-5 w-5 text-primary-foreground" />
              ) : (
                <Play className="h-5 w-5 text-primary-foreground" />
              )}
            </button>
          </div>
          <h3 className="font-semibold truncate text-center">{artist.name}</h3>
          <p className="text-muted-foreground text-sm text-center">Artist</p>
        </a>
      </Link>
    </div>
  );
}
