import {
  users, User, InsertUser,
  tracks, Track, InsertTrack,
  albums, Album, InsertAlbum,
  artists, Artist, InsertArtist,
  playlists, Playlist, InsertPlaylist,
  playlistTracks, PlaylistTrack, InsertPlaylistTrack,
  recentlyPlayed, RecentlyPlayed, InsertRecentlyPlayed,
  TrackWithDetails, PlaylistWithTracks, AlbumWithTracks
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Track operations
  getTracks(limit?: number): Promise<TrackWithDetails[]>;
  getTrack(id: number): Promise<TrackWithDetails | undefined>;
  searchTracks(query: string): Promise<TrackWithDetails[]>;
  
  // Album operations
  getAlbums(limit?: number): Promise<Album[]>;
  getAlbum(id: number): Promise<AlbumWithTracks | undefined>;
  getAlbumsByArtist(artistId: number): Promise<Album[]>;
  searchAlbums(query: string): Promise<Album[]>;
  
  // Artist operations
  getArtists(limit?: number): Promise<Artist[]>;
  getArtist(id: number): Promise<Artist | undefined>;
  searchArtists(query: string): Promise<Artist[]>;
  
  // Playlist operations
  getPlaylists(userId: number): Promise<Playlist[]>;
  getPlaylist(id: number): Promise<PlaylistWithTracks | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: number): Promise<boolean>;
  addTrackToPlaylist(playlistTrack: InsertPlaylistTrack): Promise<PlaylistTrack>;
  removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<boolean>;
  
  // Recently played operations
  addRecentlyPlayed(recentTrack: InsertRecentlyPlayed): Promise<RecentlyPlayed>;
  getRecentlyPlayed(userId: number, limit?: number): Promise<TrackWithDetails[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tracks: Map<number, Track>;
  private albums: Map<number, Album>;
  private artists: Map<number, Artist>;
  private playlists: Map<number, Playlist>;
  private playlistTracks: Map<number, PlaylistTrack>;
  private recentlyPlayed: Map<number, RecentlyPlayed>;
  
  private currentUserId: number;
  private currentTrackId: number;
  private currentAlbumId: number;
  private currentArtistId: number;
  private currentPlaylistId: number;
  private currentPlaylistTrackId: number;
  private currentRecentlyPlayedId: number;

  constructor() {
    // Initialize maps
    this.users = new Map();
    this.tracks = new Map();
    this.albums = new Map();
    this.artists = new Map();
    this.playlists = new Map();
    this.playlistTracks = new Map();
    this.recentlyPlayed = new Map();

    // Initialize IDs
    this.currentUserId = 1;
    this.currentTrackId = 1;
    this.currentAlbumId = 1;
    this.currentArtistId = 1;
    this.currentPlaylistId = 1;
    this.currentPlaylistTrackId = 1;
    this.currentRecentlyPlayedId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Track operations
  async getTracks(limit = 50): Promise<TrackWithDetails[]> {
    const tracksArray = Array.from(this.tracks.values());
    return tracksArray.slice(0, limit).map(track => this.getTrackWithDetails(track));
  }

  async getTrack(id: number): Promise<TrackWithDetails | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;
    return this.getTrackWithDetails(track);
  }

  async searchTracks(query: string): Promise<TrackWithDetails[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tracks.values())
      .filter(track => track.title.toLowerCase().includes(lowercaseQuery))
      .map(track => this.getTrackWithDetails(track));
  }

  // Album operations
  async getAlbums(limit = 50): Promise<Album[]> {
    const albumsArray = Array.from(this.albums.values());
    return albumsArray.slice(0, limit);
  }

  async getAlbum(id: number): Promise<AlbumWithTracks | undefined> {
    const album = this.albums.get(id);
    if (!album) return undefined;
    
    const tracks = Array.from(this.tracks.values())
      .filter(track => track.albumId === id);
    
    const artist = this.artists.get(album.artistId);
    if (!artist) return undefined;
    
    return { ...album, tracks, artist };
  }

  async getAlbumsByArtist(artistId: number): Promise<Album[]> {
    return Array.from(this.albums.values())
      .filter(album => album.artistId === artistId);
  }

  async searchAlbums(query: string): Promise<Album[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.albums.values())
      .filter(album => album.title.toLowerCase().includes(lowercaseQuery));
  }

  // Artist operations
  async getArtists(limit = 50): Promise<Artist[]> {
    const artistsArray = Array.from(this.artists.values());
    return artistsArray.slice(0, limit);
  }

  async getArtist(id: number): Promise<Artist | undefined> {
    return this.artists.get(id);
  }

  async searchArtists(query: string): Promise<Artist[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.artists.values())
      .filter(artist => artist.name.toLowerCase().includes(lowercaseQuery));
  }

  // Playlist operations
  async getPlaylists(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values())
      .filter(playlist => playlist.userId === userId);
  }

  async getPlaylist(id: number): Promise<PlaylistWithTracks | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    const playlistTrackEntries = Array.from(this.playlistTracks.values())
      .filter(pt => pt.playlistId === id)
      .sort((a, b) => a.order - b.order);
    
    const tracksWithDetails: TrackWithDetails[] = [];
    
    for (const ptEntry of playlistTrackEntries) {
      const track = this.tracks.get(ptEntry.trackId);
      if (track) {
        const trackWithDetails = this.getTrackWithDetails(track);
        tracksWithDetails.push(trackWithDetails);
      }
    }
    
    return { ...playlist, tracks: tracksWithDetails };
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.currentPlaylistId++;
    const now = new Date();
    const playlist: Playlist = { 
      ...insertPlaylist, 
      id, 
      createdAt: now 
    };
    
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: number, playlistUpdate: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    const updatedPlaylist = { ...playlist, ...playlistUpdate };
    this.playlists.set(id, updatedPlaylist);
    
    return updatedPlaylist;
  }

  async deletePlaylist(id: number): Promise<boolean> {
    // Delete playlist
    const deleted = this.playlists.delete(id);
    
    // Delete all associated playlist tracks
    for (const [ptId, pt] of this.playlistTracks.entries()) {
      if (pt.playlistId === id) {
        this.playlistTracks.delete(ptId);
      }
    }
    
    return deleted;
  }

  async addTrackToPlaylist(insertPlaylistTrack: InsertPlaylistTrack): Promise<PlaylistTrack> {
    const id = this.currentPlaylistTrackId++;
    const now = new Date();
    
    const playlistTrack: PlaylistTrack = {
      ...insertPlaylistTrack,
      id,
      addedAt: now
    };
    
    this.playlistTracks.set(id, playlistTrack);
    return playlistTrack;
  }

  async removeTrackFromPlaylist(playlistId: number, trackId: number): Promise<boolean> {
    let removed = false;
    
    for (const [id, pt] of this.playlistTracks.entries()) {
      if (pt.playlistId === playlistId && pt.trackId === trackId) {
        this.playlistTracks.delete(id);
        removed = true;
        break;
      }
    }
    
    // Reorder remaining tracks if track was removed
    if (removed) {
      const remainingTracks = Array.from(this.playlistTracks.values())
        .filter(pt => pt.playlistId === playlistId)
        .sort((a, b) => a.order - b.order);
      
      remainingTracks.forEach((pt, index) => {
        pt.order = index + 1;
      });
    }
    
    return removed;
  }

  // Recently played operations
  async addRecentlyPlayed(insertRecentlyPlayed: InsertRecentlyPlayed): Promise<RecentlyPlayed> {
    const id = this.currentRecentlyPlayedId++;
    const now = new Date();
    
    const recentlyPlayed: RecentlyPlayed = {
      ...insertRecentlyPlayed,
      id,
      playedAt: now
    };
    
    this.recentlyPlayed.set(id, recentlyPlayed);
    return recentlyPlayed;
  }

  async getRecentlyPlayed(userId: number, limit = 20): Promise<TrackWithDetails[]> {
    const recentlyPlayedEntries = Array.from(this.recentlyPlayed.values())
      .filter(rp => rp.userId === userId)
      .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime())
      .slice(0, limit);
    
    const tracksWithDetails: TrackWithDetails[] = [];
    
    for (const rpEntry of recentlyPlayedEntries) {
      const track = this.tracks.get(rpEntry.trackId);
      if (track) {
        const trackWithDetails = this.getTrackWithDetails(track);
        tracksWithDetails.push(trackWithDetails);
      }
    }
    
    return tracksWithDetails;
  }

  // Helper method to get track with artist and album details
  private getTrackWithDetails(track: Track): TrackWithDetails {
    const artist = this.artists.get(track.artistId);
    const album = this.albums.get(track.albumId);
    
    if (!artist || !album) {
      throw new Error(`Missing artist or album for track ${track.id}`);
    }
    
    return {
      ...track,
      artist,
      album
    };
  }

  // Initialize mock data
  private initializeMockData() {
    // Create a user
    this.createUser({
      username: "demo",
      password: "password",
      displayName: "Demo User",
      email: "demo@example.com",
      avatarUrl: "https://i.pravatar.cc/300"
    });
    
    // Create artists
    const artists: InsertArtist[] = [
      { name: "The Weeknd", imageUrl: "https://images.unsplash.com/photo-1482867899247-e295efdd8c1a?w=600", bio: "Canadian singer-songwriter and record producer." },
      { name: "Billie Eilish", imageUrl: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=600", bio: "American singer-songwriter." },
      { name: "Dua Lipa", imageUrl: "https://images.unsplash.com/photo-1501836897392-78de1e6a97a9?w=600", bio: "English singer and songwriter." },
      { name: "Drake", imageUrl: "https://images.unsplash.com/photo-1581280985087-27f57801d74f?w=600", bio: "Canadian rapper, singer, and actor." },
      { name: "Ariana Grande", imageUrl: "https://images.unsplash.com/photo-1534461104287-9ba7f7efc630?w=600", bio: "American singer and actress." },
      { name: "Bruno Mars", imageUrl: "https://images.unsplash.com/photo-1485841890310-6a055c88698a?w=600", bio: "American singer, songwriter, and record producer." },
      { name: "Taylor Swift", imageUrl: "https://images.unsplash.com/photo-1592228335-9cf6cf06dbd6?w=600", bio: "American singer-songwriter." },
      { name: "Post Malone", imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600", bio: "American rapper, singer, and songwriter." },
      { name: "Kendrick Lamar", imageUrl: "https://images.unsplash.com/photo-1570499911518-9b95b0167060?w=600", bio: "American rapper and songwriter." },
      { name: "Coldplay", imageUrl: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=600", bio: "British rock band formed in London in 1996." }
    ];
    
    artists.forEach(artist => {
      const id = this.currentArtistId++;
      this.artists.set(id, { ...artist, id });
    });
    
    // Create albums
    const albums: InsertAlbum[] = [
      { title: "After Hours", artistId: 1, releaseYear: 2020, imageUrl: "https://images.unsplash.com/photo-1603163693590-23645fe8a8a9?w=600" },
      { title: "When We All Fall Asleep, Where Do We Go?", artistId: 2, releaseYear: 2019, imageUrl: "https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=600" },
      { title: "Future Nostalgia", artistId: 3, releaseYear: 2020, imageUrl: "https://images.unsplash.com/photo-1599467556385-48b57868f038?w=600" },
      { title: "Certified Lover Boy", artistId: 4, releaseYear: 2021, imageUrl: "https://images.unsplash.com/photo-1581280985087-27f57801d74f?w=600" },
      { title: "Positions", artistId: 5, releaseYear: 2020, imageUrl: "https://images.unsplash.com/photo-1534461104287-9ba7f7efc630?w=600" },
      { title: "24K Magic", artistId: 6, releaseYear: 2016, imageUrl: "https://images.unsplash.com/photo-1485841890310-6a055c88698a?w=600" },
      { title: "Folklore", artistId: 7, releaseYear: 2020, imageUrl: "https://images.unsplash.com/photo-1592228335-9cf6cf06dbd6?w=600" },
      { title: "Hollywood's Bleeding", artistId: 8, releaseYear: 2019, imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600" },
      { title: "DAMN.", artistId: 9, releaseYear: 2017, imageUrl: "https://images.unsplash.com/photo-1570499911518-9b95b0167060?w=600" },
      { title: "Midnight Memories", artistId: 10, releaseYear: 2018, imageUrl: "https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?w=600" }
    ];
    
    albums.forEach(album => {
      const id = this.currentAlbumId++;
      this.albums.set(id, { ...album, id });
    });
    
    // Create tracks
    const createTracksForAlbum = (albumId: number, artistId: number, count: number, titlePrefix: string) => {
      for (let i = 1; i <= count; i++) {
        const id = this.currentTrackId++;
        const track: Track = {
          id,
          title: `${titlePrefix} ${i}`,
          artistId,
          albumId,
          duration: 180 + Math.floor(Math.random() * 120), // 3-5 minutes
          url: `/api/audio/${id}`, // Mock URL
          imageUrl: null
        };
        this.tracks.set(id, track);
      }
    };
    
    // Create tracks for each album
    createTracksForAlbum(1, 1, 10, "After Hours Track");
    createTracksForAlbum(2, 2, 12, "When We All Fall Asleep Track");
    createTracksForAlbum(3, 3, 11, "Future Nostalgia Track");
    createTracksForAlbum(4, 4, 15, "Certified Lover Boy Track");
    createTracksForAlbum(5, 5, 14, "Positions Track");
    createTracksForAlbum(6, 6, 9, "24K Magic Track");
    createTracksForAlbum(7, 7, 16, "Folklore Track");
    createTracksForAlbum(8, 8, 17, "Hollywood's Bleeding Track");
    createTracksForAlbum(9, 9, 14, "DAMN. Track");
    createTracksForAlbum(10, 10, 12, "Midnight Memories Track");
    
    // Create playlists
    const playlists: InsertPlaylist[] = [
      { 
        title: "Summer Vibes", 
        userId: 1, 
        description: "Perfect playlist for sunny days", 
        imageUrl: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=600" 
      },
      { 
        title: "Workout Mix", 
        userId: 1, 
        description: "High energy tracks for your workout session", 
        imageUrl: "https://images.unsplash.com/photo-1484876065684-b683cf17d276?w=600" 
      },
      { 
        title: "Chill Lofi Beats", 
        userId: 1, 
        description: "Relaxing beats to study/work to", 
        imageUrl: "https://images.unsplash.com/photo-1671641497276-e57dc9a0e8e8?w=600" 
      },
      { 
        title: "Road Trip Playlist", 
        userId: 1, 
        description: "Perfect songs for long drives", 
        imageUrl: "https://images.unsplash.com/photo-1629276301820-e9a07cf25038?w=600" 
      },
      { 
        title: "Coding Focus", 
        userId: 1, 
        description: "Concentration-enhancing tracks for coding sessions", 
        imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600" 
      },
      { 
        title: "Daily Mix 1", 
        userId: 1, 
        description: "Personalized mix based on your listening habits", 
        imageUrl: "https://images.unsplash.com/photo-1629276301820-e9a07cf25038?w=600" 
      },
      { 
        title: "Dance & EDM", 
        userId: 1, 
        description: "Best electronic dance tracks", 
        imageUrl: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600" 
      },
      { 
        title: "Focus Flow", 
        userId: 1, 
        description: "Ambient tracks to help you concentrate", 
        imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600" 
      }
    ];
    
    playlists.forEach(playlist => {
      const id = this.currentPlaylistId++;
      const now = new Date();
      this.playlists.set(id, { ...playlist, id, createdAt: now });
    });
    
    // Add tracks to playlists
    const addTracksToPlaylist = (playlistId: number, trackCount: number) => {
      const allTracks = Array.from(this.tracks.values());
      const shuffled = [...allTracks].sort(() => 0.5 - Math.random());
      const selectedTracks = shuffled.slice(0, trackCount);
      
      selectedTracks.forEach((track, index) => {
        const id = this.currentPlaylistTrackId++;
        const now = new Date();
        const playlistTrack: PlaylistTrack = {
          id,
          playlistId,
          trackId: track.id,
          addedAt: now,
          order: index + 1
        };
        this.playlistTracks.set(id, playlistTrack);
      });
    };
    
    // Add tracks to each playlist
    for (let i = 1; i <= playlists.length; i++) {
      addTracksToPlaylist(i, 10 + Math.floor(Math.random() * 10)); // 10-20 tracks per playlist
    }
    
    // Add recently played tracks
    const addRecentlyPlayed = (userId: number, count: number) => {
      const allTracks = Array.from(this.tracks.values());
      const shuffled = [...allTracks].sort(() => 0.5 - Math.random());
      const selectedTracks = shuffled.slice(0, count);
      
      selectedTracks.forEach(track => {
        const id = this.currentRecentlyPlayedId++;
        const randomMinutesAgo = Math.floor(Math.random() * 10080); // Random time in the last week (7 * 24 * 60 minutes)
        const playedAt = new Date(Date.now() - randomMinutesAgo * 60 * 1000);
        
        const recentlyPlayed: RecentlyPlayed = {
          id,
          userId,
          trackId: track.id,
          playedAt
        };
        
        this.recentlyPlayed.set(id, recentlyPlayed);
      });
    };
    
    // Add recently played tracks for the demo user
    addRecentlyPlayed(1, 30);
  }
}

export const storage = new MemStorage();
