export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: Genre[];
  director?: string;
  cast?: string[];
  production_companies?: ProductionCompany[];
  credits?: Credits;
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  genres?: Genre[];
  created_by?: string[];
  cast?: string[];
  production_companies?: ProductionCompany[];
  credits?: Credits;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

export interface DetailedRating {
  contentId: number;
  contentType: 'movie' | 'tv';
  overall: number;
  acting: number;
  screenplay: number;
  direction: number;
  timestamp: number;
  review?: string;
}

export interface UserRating {
  contentId: number;
  contentType: 'movie' | 'tv';
  rating: number;
  timestamp: number;
}

export interface CreatorProfile {
  id: number;
  name: string;
  type: 'actor' | 'director' | 'writer';
  averageRating: number;
  totalRatings: number;
  profilePath?: string;
  department?: string;
  job?: string;
}

export interface StudioProfile {
  id: number;
  name: string;
  averageRating: number;
  totalRatings: number;
  logoPath?: string;
}

export interface UserProfile {
  ratings: UserRating[];
  detailedRatings: DetailedRating[];
  genrePreferences: { [genreId: number]: number };
  creatorProfiles: { [creatorId: number]: CreatorProfile };
  studioProfiles: { [studioId: number]: StudioProfile };
  followedCreators: number[];
  followedStudios: number[];
  currentMood?: string;
  watchlist: number[];
  favoriteActors: number[];
  favoriteDirectors: number[];
  favoriteStudios: number[];
  lastUpdated: number;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string;
  known_for_department: string;
}

export interface Notification {
  id: string;
  type: 'new_release' | 'recommendation' | 'followed_creator';
  title: string;
  message: string;
  contentId?: number;
  creatorId?: number;
  studioId?: number;
  timestamp: number;
  read: boolean;
}

export type ContentItem = Movie | TVShow;
export type Mood = 'happy' | 'sad' | 'excited' | 'relaxed' | 'adventurous' | 'romantic' | 'thoughtful' | 'nostalgic' | 'mysterious';

export interface MoodConfig {
  id: Mood;
  name: string;
  emoji: string;
  color: string;
  genreIds: number[];
  description: string;
}