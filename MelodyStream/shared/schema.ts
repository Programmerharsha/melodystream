import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  email: true,
  avatarUrl: true,
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artistId: integer("artist_id").notNull(),
  albumId: integer("album_id").notNull(),
  duration: integer("duration").notNull(), // in seconds
  url: text("url").notNull(), // audio file URL
  imageUrl: text("image_url"), // track image URL if different from album
});

export const insertTrackSchema = createInsertSchema(tracks).pick({
  title: true,
  artistId: true,
  albumId: true,
  duration: true,
  url: true,
  imageUrl: true,
});

export const albums = pgTable("albums", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artistId: integer("artist_id").notNull(),
  releaseYear: integer("release_year"),
  imageUrl: text("image_url").notNull(),
});

export const insertAlbumSchema = createInsertSchema(albums).pick({
  title: true,
  artistId: true,
  releaseYear: true,
  imageUrl: true,
});

export const artists = pgTable("artists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  bio: text("bio"),
});

export const insertArtistSchema = createInsertSchema(artists).pick({
  name: true,
  imageUrl: true,
  bio: true,
});

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPlaylistSchema = createInsertSchema(playlists).pick({
  title: true,
  userId: true,
  description: true,
  imageUrl: true,
});

export const playlistTracks = pgTable("playlist_tracks", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  trackId: integer("track_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  order: integer("order").notNull(),
});

export const insertPlaylistTrackSchema = createInsertSchema(playlistTracks).pick({
  playlistId: true,
  trackId: true,
  order: true,
});

export const recentlyPlayed = pgTable("recently_played", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackId: integer("track_id").notNull(),
  playedAt: timestamp("played_at").defaultNow(),
});

export const insertRecentlyPlayedSchema = createInsertSchema(recentlyPlayed).pick({
  userId: true,
  trackId: true,
});

// Type Definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type Album = typeof albums.$inferSelect;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = z.infer<typeof insertPlaylistTrackSchema>;

export type RecentlyPlayed = typeof recentlyPlayed.$inferSelect;
export type InsertRecentlyPlayed = z.infer<typeof insertRecentlyPlayedSchema>;

// Extended types for frontend use
export type TrackWithDetails = Track & {
  artist: Artist;
  album: Album;
};

export type PlaylistWithTracks = Playlist & {
  tracks: TrackWithDetails[];
};

export type AlbumWithTracks = Album & {
  tracks: Track[];
  artist: Artist;
};
