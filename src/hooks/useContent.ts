import { useState, useEffect } from 'react';
import { Movie, TVShow, Genre, ContentItem } from '../types';
import {
  getTrendingMovies,
  getTrendingTVShows,
  getPopularMovies,
  getPopularTVShows,
  getMovieGenres,
  getTVGenres,
  discoverMoviesByGenre,
  discoverTVShowsByGenre,
  discoverContent,
  searchContent
} from '../services/tmdbApi';

export const useContent = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial content
  useEffect(() => {
    const loadInitialContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          trendingMoviesData,
          trendingTVData,
          popularMoviesData,
          popularTVData,
          movieGenresData,
          tvGenresData
        ] = await Promise.all([
          getTrendingMovies(),
          getTrendingTVShows(),
          getPopularMovies(),
          getPopularTVShows(),
          getMovieGenres(),
          getTVGenres()
        ]);

        setTrendingMovies(trendingMoviesData);
        setTrendingTVShows(trendingTVData);
        setPopularMovies(popularMoviesData);
        setPopularTVShows(popularTVData);
        
        // Combine and deduplicate genres
        const allGenres = [...movieGenresData, ...tvGenresData];
        const uniqueGenres = allGenres.filter((genre, index, self) => 
          index === self.findIndex(g => g.id === genre.id)
        );
        setGenres(uniqueGenres);

      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load content. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialContent();
  }, []);

  // Discover content with filters
  const discoverContentWithFilters = async (filters: {
    contentType: 'movie' | 'tv' | 'all';
    genreIds?: number[];
    year?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
  }): Promise<ContentItem[]> => {
    try {
      return await discoverContent(filters);
    } catch (err) {
      console.error('Error discovering content with filters:', err);
      return [];
    }
  };

  // Get content by genre preferences
  const getRecommendedContent = async (genreIds: number[], limit: number = 20): Promise<ContentItem[]> => {
    try {
      if (genreIds.length === 0) {
        // If no preferences, return trending content
        return [...trendingMovies, ...trendingTVShows].slice(0, limit);
      }

      const [movies, tvShows] = await Promise.all([
        discoverMoviesByGenre(genreIds),
        discoverTVShowsByGenre(genreIds)
      ]);

      const allContent: ContentItem[] = [...movies, ...tvShows];
      
      // Sort by vote average and return top results
      return allContent
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, limit);
    } catch (err) {
      console.error('Error getting recommended content:', err);
      return [];
    }
  };

  // Search for content
  const searchForContent = async (query: string): Promise<ContentItem[]> => {
    try {
      if (!query.trim()) return [];
      return await searchContent(query);
    } catch (err) {
      console.error('Error searching content:', err);
      return [];
    }
  };

  // Get content by mood
  const getContentByMood = async (mood: string): Promise<ContentItem[]> => {
    const moodGenreMap: { [key: string]: number[] } = {
      happy: [35, 10751, 16], // Comedy, Family, Animation
      sad: [18, 10749], // Drama, Romance
      excited: [28, 12, 878], // Action, Adventure, Sci-Fi
      relaxed: [99, 36, 10402], // Documentary, History, Music
      adventurous: [12, 14, 28], // Adventure, Fantasy, Action
      romantic: [10749, 35, 18], // Romance, Comedy, Drama
      thoughtful: [18, 99, 36] // Drama, Documentary, History
    };

    const genreIds = moodGenreMap[mood] || [];
    return await getRecommendedContent(genreIds, 12);
  };

  return {
    trendingMovies,
    trendingTVShows,
    popularMovies,
    popularTVShows,
    genres,
    loading,
    error,
    discoverContentWithFilters,
    getRecommendedContent,
    searchForContent,
    getContentByMood
  };
};