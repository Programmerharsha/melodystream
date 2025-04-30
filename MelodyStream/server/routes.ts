import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlaylistSchema, 
  insertPlaylistTrackSchema, 
  insertRecentlyPlayedSchema,
  insertUserSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userInput = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userInput);
      
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  });

  // Tracks routes
  app.get('/api/tracks', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const tracks = await storage.getTracks(limit);
    res.json(tracks);
  });
  
  app.get('/api/tracks/:id', async (req: Request, res: Response) => {
    const trackId = parseInt(req.params.id, 10);
    if (isNaN(trackId)) {
      return res.status(400).json({ message: "Invalid track ID" });
    }
    
    const track = await storage.getTrack(trackId);
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    
    res.json(track);
  });

  app.get('/api/search', async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    const [tracks, albums, artists] = await Promise.all([
      storage.searchTracks(query),
      storage.searchAlbums(query),
      storage.searchArtists(query)
    ]);
    
    res.json({ tracks, albums, artists });
  });

  // Albums routes
  app.get('/api/albums', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const albums = await storage.getAlbums(limit);
    res.json(albums);
  });
  
  app.get('/api/albums/:id', async (req: Request, res: Response) => {
    const albumId = parseInt(req.params.id, 10);
    if (isNaN(albumId)) {
      return res.status(400).json({ message: "Invalid album ID" });
    }
    
    const album = await storage.getAlbum(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    
    res.json(album);
  });
  
  app.get('/api/artists/:artistId/albums', async (req: Request, res: Response) => {
    const artistId = parseInt(req.params.artistId, 10);
    if (isNaN(artistId)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }
    
    const albums = await storage.getAlbumsByArtist(artistId);
    res.json(albums);
  });

  // Artists routes
  app.get('/api/artists', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const artists = await storage.getArtists(limit);
    res.json(artists);
  });
  
  app.get('/api/artists/:id', async (req: Request, res: Response) => {
    const artistId = parseInt(req.params.id, 10);
    if (isNaN(artistId)) {
      return res.status(400).json({ message: "Invalid artist ID" });
    }
    
    const artist = await storage.getArtist(artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }
    
    res.json(artist);
  });

  // Playlists routes
  app.get('/api/users/:userId/playlists', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const playlists = await storage.getPlaylists(userId);
    res.json(playlists);
  });
  
  app.get('/api/playlists/:id', async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id, 10);
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    
    const playlist = await storage.getPlaylist(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    res.json(playlist);
  });
  
  app.post('/api/playlists', async (req: Request, res: Response) => {
    try {
      const playlistInput = insertPlaylistSchema.parse(req.body);
      const newPlaylist = await storage.createPlaylist(playlistInput);
      
      res.status(201).json(newPlaylist);
    } catch (error) {
      res.status(400).json({ message: "Invalid playlist data" });
    }
  });
  
  app.patch('/api/playlists/:id', async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id, 10);
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    
    try {
      const playlistInput = insertPlaylistSchema.partial().parse(req.body);
      const updatedPlaylist = await storage.updatePlaylist(playlistId, playlistInput);
      
      if (!updatedPlaylist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      res.json(updatedPlaylist);
    } catch (error) {
      res.status(400).json({ message: "Invalid playlist data" });
    }
  });
  
  app.delete('/api/playlists/:id', async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id, 10);
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    
    const success = await storage.deletePlaylist(playlistId);
    if (!success) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    
    res.status(204).end();
  });
  
  app.post('/api/playlists/:playlistId/tracks', async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.playlistId, 10);
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    
    try {
      const playlistTrackInput = insertPlaylistTrackSchema.parse({
        ...req.body,
        playlistId
      });
      
      const newPlaylistTrack = await storage.addTrackToPlaylist(playlistTrackInput);
      res.status(201).json(newPlaylistTrack);
    } catch (error) {
      res.status(400).json({ message: "Invalid playlist track data" });
    }
  });
  
  app.delete('/api/playlists/:playlistId/tracks/:trackId', async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.playlistId, 10);
    const trackId = parseInt(req.params.trackId, 10);
    
    if (isNaN(playlistId) || isNaN(trackId)) {
      return res.status(400).json({ message: "Invalid playlist or track ID" });
    }
    
    const success = await storage.removeTrackFromPlaylist(playlistId, trackId);
    if (!success) {
      return res.status(404).json({ message: "Playlist track not found" });
    }
    
    res.status(204).end();
  });

  // Recently played routes
  app.post('/api/recently-played', async (req: Request, res: Response) => {
    try {
      const recentlyPlayedInput = insertRecentlyPlayedSchema.parse(req.body);
      const newRecentlyPlayed = await storage.addRecentlyPlayed(recentlyPlayedInput);
      
      res.status(201).json(newRecentlyPlayed);
    } catch (error) {
      res.status(400).json({ message: "Invalid recently played data" });
    }
  });
  
  app.get('/api/users/:userId/recently-played', async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const recentlyPlayed = await storage.getRecentlyPlayed(userId, limit);
    
    res.json(recentlyPlayed);
  });

  // Just for testing the API
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
