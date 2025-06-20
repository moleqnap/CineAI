const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const API_KEY = "b9d3d6608dd737fe6ec082ca465925db";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiOWQzZDY2MDhkZDczN2ZlNmVjMDgyY2E0NjU5MjVkYiIsIm5iZiI6MTc1MDE3MTM2MS42OTUwMDAyLCJzdWIiOiI2ODUxN2VlMWE5YzQzN2E1Zjk2YWVhYzIiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.P0JpTq0bBBjdCADmMJAIc87sr22JKSBmuEhMiDLM5YQ";

const BASE_URL = "https://api.themoviedb.org/3";

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to check cache
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cache
const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Helper function to build image URLs
export const getImageUrl = (path: string, size: string = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

// Get trending movies
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week') => {
  const cacheKey = `trending_movies_${timeWindow}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/movie/${timeWindow}?api_key=${API_KEY}`);
    
    if (!response.ok) throw new Error('Failed to fetch trending movies');
    
    const data = await response.json();
    const movies = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
      genres: []
    }));

    setCachedData(cacheKey, movies);
    return movies;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return [];
  }
};

// Get trending TV shows
export const getTrendingTVShows = async (timeWindow: 'day' | 'week' = 'week') => {
  const cacheKey = `trending_tv_${timeWindow}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/trending/tv/${timeWindow}?api_key=${API_KEY}`);
    
    if (!response.ok) throw new Error('Failed to fetch trending TV shows');
    
    const data = await response.json();
    const tvShows = data.results.map((show: any) => ({
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster_path: getImageUrl(show.poster_path),
      backdrop_path: getImageUrl(show.backdrop_path, 'w1280'),
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      genre_ids: show.genre_ids,
      genres: []
    }));

    setCachedData(cacheKey, tvShows);
    return tvShows;
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    return [];
  }
};

// Get movie genres
export const getMovieGenres = async () => {
  const cacheKey = 'movie_genres';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    
    if (!response.ok) throw new Error('Failed to fetch movie genres');
    
    const data = await response.json();
    setCachedData(cacheKey, data.genres);
    return data.genres;
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    return [];
  }
};

// Get TV genres
export const getTVGenres = async () => {
  const cacheKey = 'tv_genres';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list?api_key=${API_KEY}`);
    
    if (!response.ok) throw new Error('Failed to fetch TV genres');
    
    const data = await response.json();
    setCachedData(cacheKey, data.genres);
    return data.genres;
  } catch (error) {
    console.error('Error fetching TV genres:', error);
    return [];
  }
};

// Get popular movies
export const getPopularMovies = async (page: number = 1) => {
  const cacheKey = `popular_movies_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
    
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    
    const data = await response.json();
    const movies = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
      genres: []
    }));

    setCachedData(cacheKey, movies);
    return movies;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

// Get popular TV shows
export const getPopularTVShows = async (page: number = 1) => {
  const cacheKey = `popular_tv_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
    
    if (!response.ok) throw new Error('Failed to fetch popular TV shows');
    
    const data = await response.json();
    const tvShows = data.results.map((show: any) => ({
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster_path: getImageUrl(show.poster_path),
      backdrop_path: getImageUrl(show.backdrop_path, 'w1280'),
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      genre_ids: show.genre_ids,
      genres: []
    }));

    setCachedData(cacheKey, tvShows);
    return tvShows;
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    return [];
  }
};

// Get content videos (trailers)
export const getContentVideos = async (contentId: number, contentType: 'movie' | 'tv') => {
  const cacheKey = `videos_${contentType}_${contentId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/${contentType}/${contentId}/videos?api_key=${API_KEY}`);
    
    if (!response.ok) throw new Error('Failed to fetch videos');
    
    const data = await response.json();
    
    // Filter for YouTube trailers
    const trailers = data.results.filter((video: any) => 
      video.site === 'YouTube' && 
      (video.type === 'Trailer' || video.type === 'Teaser')
    );

    setCachedData(cacheKey, trailers);
    return trailers;
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// Enhanced discover with personalized filters
export const discoverPersonalizedContent = async (filters: {
  contentType: 'movie' | 'tv' | 'all';
  genreIds?: number[];
  yearRange?: { start: number; end: number };
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  withKeywords?: number[];
  excludeIds?: number[];
}) => {
  const {
    contentType,
    genreIds = [],
    yearRange,
    minRating = 6.0,
    maxRating = 10.0,
    sortBy = 'vote_average',
    sortOrder = 'desc',
    page = Math.floor(Math.random() * 5) + 1, // Random page for variety
    withKeywords = [],
    excludeIds = []
  } = filters;

  const cacheKey = `personalized_${contentType}_${genreIds.join(',')}_${yearRange?.start}_${yearRange?.end}_${minRating}_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let results: any[] = [];

    // Map sort options to TMDB API parameters
    const sortMapping: { [key: string]: string } = {
      popularity: 'popularity',
      rating: 'vote_average',
      release_date: contentType === 'movie' ? 'release_date' : 'first_air_date',
      title: contentType === 'movie' ? 'title' : 'name'
    };

    const sortParam = `${sortMapping[sortBy] || 'vote_average'}.${sortOrder}`;

    if (contentType === 'all' || contentType === 'movie') {
      // Build movie discover URL with enhanced filters
      const movieParams = new URLSearchParams({
        api_key: API_KEY,
        sort_by: sortParam,
        page: page.toString(),
        'vote_average.gte': minRating.toString(),
        'vote_average.lte': maxRating.toString(),
        'vote_count.gte': '100' // Minimum vote count for quality
      });

      if (genreIds.length > 0) {
        movieParams.append('with_genres', genreIds.join(','));
      }

      if (yearRange) {
        movieParams.append('release_date.gte', `${yearRange.start}-01-01`);
        movieParams.append('release_date.lte', `${yearRange.end}-12-31`);
      }

      if (withKeywords.length > 0) {
        movieParams.append('with_keywords', withKeywords.join(','));
      }

      const movieResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?${movieParams}`);
      if (movieResponse.ok) {
        const movieData = await movieResponse.json();
        const movies = movieData.results
          .filter((movie: any) => !excludeIds.includes(movie.id))
          .map((movie: any) => ({
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: getImageUrl(movie.poster_path),
            backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genre_ids: movie.genre_ids,
            genres: [],
            media_type: 'movie',
            popularity: movie.popularity
          }));
        results = [...results, ...movies];
      }
    }

    if (contentType === 'all' || contentType === 'tv') {
      // Build TV discover URL with enhanced filters
      const tvParams = new URLSearchParams({
        api_key: API_KEY,
        sort_by: sortParam,
        page: page.toString(),
        'vote_average.gte': minRating.toString(),
        'vote_average.lte': maxRating.toString(),
        'vote_count.gte': '50' // Lower threshold for TV shows
      });

      if (genreIds.length > 0) {
        tvParams.append('with_genres', genreIds.join(','));
      }

      if (yearRange) {
        tvParams.append('first_air_date.gte', `${yearRange.start}-01-01`);
        tvParams.append('first_air_date.lte', `${yearRange.end}-12-31`);
      }

      if (withKeywords.length > 0) {
        tvParams.append('with_keywords', withKeywords.join(','));
      }

      const tvResponse = await fetch(`${TMDB_BASE_URL}/discover/tv?${tvParams}`);
      if (tvResponse.ok) {
        const tvData = await tvResponse.json();
        const tvShows = tvData.results
          .filter((show: any) => !excludeIds.includes(show.id))
          .map((show: any) => ({
            id: show.id,
            name: show.name,
            overview: show.overview,
            poster_path: getImageUrl(show.poster_path),
            backdrop_path: getImageUrl(show.backdrop_path, 'w1280'),
            first_air_date: show.first_air_date,
            vote_average: show.vote_average,
            genre_ids: show.genre_ids,
            genres: [],
            media_type: 'tv',
            popularity: show.popularity
          }));
        results = [...results, ...tvShows];
      }
    }

    // Sort results if mixing content types
    if (contentType === 'all') {
      results.sort((a, b) => {
        switch (sortBy) {
          case 'popularity':
            return sortOrder === 'desc' ? b.popularity - a.popularity : a.popularity - b.popularity;
          case 'rating':
            return sortOrder === 'desc' ? b.vote_average - a.vote_average : a.vote_average - b.vote_average;
          case 'release_date':
            const aDate = new Date(a.release_date || a.first_air_date).getTime();
            const bDate = new Date(b.release_date || b.first_air_date).getTime();
            return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
          case 'title':
            const aTitle = (a.title || a.name).toLowerCase();
            const bTitle = (b.title || b.name).toLowerCase();
            return sortOrder === 'desc' ? bTitle.localeCompare(aTitle) : aTitle.localeCompare(bTitle);
          default:
            return 0;
        }
      });
    }

    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error discovering personalized content:', error);
    return [];
  }
};

// Advanced discover with filters
export const discoverContent = async (filters: {
  contentType: 'movie' | 'tv' | 'all';
  genreIds?: number[];
  year?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
}) => {
  const {
    contentType,
    genreIds = [],
    year,
    sortBy = 'popularity',
    sortOrder = 'desc',
    page = 1
  } = filters;

  const cacheKey = `discover_${contentType}_${genreIds.join(',')}_${year}_${sortBy}_${sortOrder}_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    let results: any[] = [];

    // Map sort options to TMDB API parameters
    const sortMapping: { [key: string]: string } = {
      popularity: 'popularity',
      rating: 'vote_average',
      release_date: contentType === 'movie' ? 'release_date' : 'first_air_date',
      title: contentType === 'movie' ? 'title' : 'name'
    };

    const sortParam = `${sortMapping[sortBy]}.${sortOrder}`;

    if (contentType === 'all' || contentType === 'movie') {
      // Build movie discover URL
      const movieParams = new URLSearchParams({
        api_key: API_KEY,
        sort_by: sortParam,
        page: page.toString(),
        vote_count: '50' // Minimum vote count for quality
      });

      if (genreIds.length > 0) {
        movieParams.append('with_genres', genreIds.join(','));
      }

      if (year) {
        movieParams.append('year', year);
      }

      const movieResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?${movieParams}`);
      if (movieResponse.ok) {
        const movieData = await movieResponse.json();
        const movies = movieData.results.map((movie: any) => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: getImageUrl(movie.poster_path),
          backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids,
          genres: [],
          media_type: 'movie'
        }));
        results = [...results, ...movies];
      }
    }

    if (contentType === 'all' || contentType === 'tv') {
      // Build TV discover URL
      const tvParams = new URLSearchParams({
        api_key: API_KEY,
        sort_by: sortParam,
        page: page.toString(),
        vote_count: '20' // Lower threshold for TV shows
      });

      if (genreIds.length > 0) {
        tvParams.append('with_genres', genreIds.join(','));
      }

      if (year) {
        tvParams.append('first_air_date_year', year);
      }

      const tvResponse = await fetch(`${TMDB_BASE_URL}/discover/tv?${tvParams}`);
      if (tvResponse.ok) {
        const tvData = await tvResponse.json();
        const tvShows = tvData.results.map((show: any) => ({
          id: show.id,
          name: show.name,
          overview: show.overview,
          poster_path: getImageUrl(show.poster_path),
          backdrop_path: getImageUrl(show.backdrop_path, 'w1280'),
          first_air_date: show.first_air_date,
          vote_average: show.vote_average,
          genre_ids: show.genre_ids,
          genres: [],
          media_type: 'tv'
        }));
        results = [...results, ...tvShows];
      }
    }

    // Sort results if mixing content types
    if (contentType === 'all') {
      results.sort((a, b) => {
        switch (sortBy) {
          case 'popularity':
            return sortOrder === 'desc' ? b.popularity - a.popularity : a.popularity - b.popularity;
          case 'rating':
            return sortOrder === 'desc' ? b.vote_average - a.vote_average : a.vote_average - b.vote_average;
          case 'release_date':
            const aDate = new Date(a.release_date || a.first_air_date).getTime();
            const bDate = new Date(b.release_date || b.first_air_date).getTime();
            return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
          case 'title':
            const aTitle = (a.title || a.name).toLowerCase();
            const bTitle = (b.title || b.name).toLowerCase();
            return sortOrder === 'desc' ? bTitle.localeCompare(aTitle) : aTitle.localeCompare(bTitle);
          default:
            return 0;
        }
      });
    }

    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error discovering content:', error);
    return [];
  }
};

// Discover movies by genre
export const discoverMoviesByGenre = async (genreIds: number[], page: number = 1) => {
  const genreString = genreIds.join(',');
  const cacheKey = `discover_movies_${genreString}_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreString}&page=${page}&sort_by=vote_average.desc&vote_count.gte=100`
    );
    
    if (!response.ok) throw new Error('Failed to discover movies');
    
    const data = await response.json();
    const movies = data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
      genres: []
    }));

    setCachedData(cacheKey, movies);
    return movies;
  } catch (error) {
    console.error('Error discovering movies:', error);
    return [];
  }
};

// Discover TV shows by genre
export const discoverTVShowsByGenre = async (genreIds: number[], page: number = 1) => {
  const genreString = genreIds.join(',');
  const cacheKey = `discover_tv_${genreString}_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreString}&page=${page}&sort_by=vote_average.desc&vote_count.gte=50`
    );
    
    if (!response.ok) throw new Error('Failed to discover TV shows');
    
    const data = await response.json();
    const tvShows = data.results.map((show: any) => ({
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster_path: getImageUrl(show.poster_path),
      backdrop_path: getImageUrl(show.backdrop_path, 'w1280'),
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      genre_ids: show.genre_ids,
      genres: []
    }));

    setCachedData(cacheKey, tvShows);
    return tvShows;
  } catch (error) {
    console.error('Error discovering TV shows:', error);
    return [];
  }
};

// Search for movies and TV shows
export const searchContent = async (query: string, page: number = 1) => {
  const cacheKey = `search_${query}_${page}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const [moviesResponse, tvResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`),
      fetch(`${TMDB_BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`)
    ]);

    const [moviesData, tvData] = await Promise.all([
      moviesResponse.json(),
      tvResponse.json()
    ]);

    const movies = moviesData.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genre_ids,
      genres: [],
      media_type: 'movie'
    }));

    const tvShows = tvData.results.map((show: any) => ({
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster_path: getImageUrl(show.poster_path),
      backdrop_path: getImageUrl(show.backdrop_path, 'w1280'),
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      genre_ids: show.genre_ids,
      genres: [],
      media_type: 'tv'
    }));

    const results = [...movies, ...tvShows].sort((a, b) => b.vote_average - a.vote_average);
    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching content:', error);
    return [];
  }
};

// Get movie details with credits
export const getMovieDetails = async (movieId: number) => {
  const cacheKey = `movie_details_${movieId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`);
    
    if (!response.ok) throw new Error('Failed to fetch movie details');
    
    const movie = await response.json();
    const movieDetails = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: getImageUrl(movie.poster_path),
      backdrop_path: getImageUrl(movie.backdrop_path, 'w1280'),
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      genre_ids: movie.genres.map((g: any) => g.id),
      genres: movie.genres,
      runtime: movie.runtime,
      budget: movie.budget,
      revenue: movie.revenue,
      production_companies: movie.production_companies,
      credits: movie.credits ? {
        cast: movie.credits.cast.map((actor: any) => ({
          ...actor,
          profile_path: actor.profile_path ? getImageUrl(actor.profile_path, 'w185') : null
        })),
        crew: movie.credits.crew.map((member: any) => ({
          ...member,
          profile_path: member.profile_path ? getImageUrl(member.profile_path, 'w185') : null
        }))
      } : null
    };

    setCachedData(cacheKey, movieDetails);
    return movieDetails;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

// Get TV show details with credits
export const getTVShowDetails = async (tvId: number) => {
  const cacheKey = `tv_details_${tvId}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits`);
    
    if (!response.ok) throw new Error('Failed to fetch TV show details');
    
    const show = await response.json();
    const showDetails = {
      id: show.id,
      name: show.name,
      overview: show.overview,
      poster_path: getImageUrl(show.poster_path),
      backdrop_path: getImageUrl(show.backdrop_path, 'w1280'),
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      genre_ids: show.genres.map((g: any) => g.id),
      genres: show.genres,
      number_of_seasons: show.number_of_seasons,
      number_of_episodes: show.number_of_episodes,
      status: show.status,
      production_companies: show.production_companies,
      credits: show.credits ? {
        cast: show.credits.cast.map((actor: any) => ({
          ...actor,
          profile_path: actor.profile_path ? getImageUrl(actor.profile_path, 'w185') : null
        })),
        crew: show.credits.crew.map((member: any) => ({
          ...member,
          profile_path: member.profile_path ? getImageUrl(member.profile_path, 'w185') : null
        }))
      } : null
    };

    setCachedData(cacheKey, showDetails);
    return showDetails;
  } catch (error) {
    console.error('Error fetching TV show details:', error);
    return null;
  }
};