import { discoverContent, getMovieDetails, getTVShowDetails } from './tmdbApi';
import { ContentItem } from '../types';

// Extended discovery parameters for comprehensive content search
export interface AdvancedDiscoveryParams {
  genreIds?: number[];
  yearRange?: { start: number; end: number };
  ratingRange?: { min: number; max: number };
  voteCountMin?: number;
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'revenue';
  sortOrder?: 'asc' | 'desc';
  includeAdult?: boolean;
  originalLanguage?: string;
  withCompanies?: number[];
  withKeywords?: number[];
  page?: number;
  contentType?: 'movie' | 'tv' | 'all';
}

// Comprehensive content discovery across all years
export const discoverAdvancedContent = async (params: AdvancedDiscoveryParams): Promise<ContentItem[]> => {
  const {
    genreIds = [],
    yearRange,
    ratingRange,
    voteCountMin = 10,
    sortBy = 'rating',
    sortOrder = 'desc',
    includeAdult = false,
    originalLanguage,
    withCompanies,
    withKeywords,
    page = 1,
    contentType = 'all'
  } = params;

  try {
    let allResults: ContentItem[] = [];

    // If year range is specified, search within that range
    if (yearRange) {
      const years = [];
      for (let year = yearRange.start; year <= yearRange.end; year++) {
        years.push(year);
      }

      // Search each year to get comprehensive results
      for (const year of years.slice(0, 10)) { // Limit to 10 years per request
        const yearResults = await discoverContent({
          contentType,
          genreIds,
          year: year.toString(),
          sortBy,
          sortOrder,
          page
        });

        // Filter by rating range if specified
        const filteredResults = ratingRange 
          ? yearResults.filter(content => 
              content.vote_average >= ratingRange.min && 
              content.vote_average <= ratingRange.max
            )
          : yearResults;

        allResults = [...allResults, ...filteredResults];
      }
    } else {
      // Standard discovery without year range
      const results = await discoverContent({
        contentType,
        genreIds,
        sortBy,
        sortOrder,
        page
      });

      allResults = ratingRange 
        ? results.filter(content => 
            content.vote_average >= ratingRange.min && 
            content.vote_average <= ratingRange.max
          )
        : results;
    }

    // Remove duplicates and sort
    const uniqueResults = allResults
      .filter((content, index, self) => 
        index === self.findIndex(c => c.id === content.id)
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return sortOrder === 'desc' ? b.vote_average - a.vote_average : a.vote_average - b.vote_average;
          case 'popularity':
            return sortOrder === 'desc' ? (b as any).popularity - (a as any).popularity : (a as any).popularity - (b as any).popularity;
          case 'release_date':
            const aDate = new Date('release_date' in a ? a.release_date : a.first_air_date).getTime();
            const bDate = new Date('release_date' in b ? b.release_date : b.first_air_date).getTime();
            return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
          default:
            return 0;
        }
      });

    return uniqueResults;
  } catch (error) {
    console.error('Error in advanced content discovery:', error);
    return [];
  }
};

// Discover hidden gems (high rating, lower popularity)
export const discoverHiddenGems = async (genreIds: number[] = [], yearRange?: { start: number; end: number }): Promise<ContentItem[]> => {
  return discoverAdvancedContent({
    genreIds,
    yearRange,
    ratingRange: { min: 7.5, max: 10 },
    voteCountMin: 50,
    sortBy: 'rating',
    sortOrder: 'desc',
    contentType: 'all'
  });
};

// Discover classic films (older than 15 years, high rated)
export const discoverClassics = async (genreIds: number[] = []): Promise<ContentItem[]> => {
  const currentYear = new Date().getFullYear();
  return discoverAdvancedContent({
    genreIds,
    yearRange: { start: 1970, end: currentYear - 15 },
    ratingRange: { min: 7.0, max: 10 },
    voteCountMin: 100,
    sortBy: 'rating',
    sortOrder: 'desc',
    contentType: 'all'
  });
};

// Discover content by decade
export const discoverByDecade = async (decade: number, genreIds: number[] = []): Promise<ContentItem[]> => {
  return discoverAdvancedContent({
    genreIds,
    yearRange: { start: decade, end: decade + 9 },
    ratingRange: { min: 6.0, max: 10 },
    voteCountMin: 20,
    sortBy: 'rating',
    sortOrder: 'desc',
    contentType: 'all'
  });
};

// Discover underrated content (good rating but lower vote count)
export const discoverUnderrated = async (genreIds: number[] = []): Promise<ContentItem[]> => {
  return discoverAdvancedContent({
    genreIds,
    ratingRange: { min: 7.0, max: 10 },
    voteCountMin: 10, // Lower vote count for underrated content
    sortBy: 'rating',
    sortOrder: 'desc',
    contentType: 'all'
  });
};

// Get comprehensive content details with enhanced metadata
export const getEnhancedContentDetails = async (contentId: number, contentType: 'movie' | 'tv') => {
  try {
    const details = contentType === 'movie' 
      ? await getMovieDetails(contentId)
      : await getTVShowDetails(contentId);

    if (!details) return null;

    // Add enhanced metadata
    const releaseYear = new Date(
      'release_date' in details ? details.release_date : details.first_air_date
    ).getFullYear();
    
    const currentYear = new Date().getFullYear();
    const contentAge = currentYear - releaseYear;
    const decade = Math.floor(releaseYear / 10) * 10;

    return {
      ...details,
      metadata: {
        releaseYear,
        contentAge,
        decade: `${decade}s`,
        isClassic: contentAge >= 15,
        isRecent: contentAge <= 3,
        isHiddenGem: details.vote_average >= 7.5 && details.vote_average < 8.5,
        qualityTier: details.vote_average >= 8.0 ? 'excellent' : 
                    details.vote_average >= 7.0 ? 'good' : 
                    details.vote_average >= 6.0 ? 'decent' : 'poor'
      }
    };
  } catch (error) {
    console.error('Error getting enhanced content details:', error);
    return null;
  }
};

// Multi-criteria content search for personalized recommendations
export const searchPersonalizedContent = async (criteria: {
  preferredGenres: number[];
  preferredDecades: number[];
  qualityThreshold: number;
  diversityFactor: number;
  excludeIds: number[];
  limit: number;
}): Promise<ContentItem[]> => {
  const {
    preferredGenres,
    preferredDecades,
    qualityThreshold,
    diversityFactor,
    excludeIds,
    limit
  } = criteria;

  try {
    let allResults: ContentItem[] = [];

    // Search by preferred genres and decades
    for (const decade of preferredDecades.slice(0, 3)) {
      for (const genreChunk of chunkArray(preferredGenres, 3)) {
        const results = await discoverByDecade(decade, genreChunk);
        const filteredResults = results
          .filter(content => 
            content.vote_average >= qualityThreshold &&
            !excludeIds.includes(content.id)
          )
          .slice(0, Math.ceil(limit / (preferredDecades.length * Math.ceil(preferredGenres.length / 3))));
        
        allResults = [...allResults, ...filteredResults];
      }
    }

    // Add some hidden gems for diversity
    if (diversityFactor > 0.5) {
      const hiddenGems = await discoverHiddenGems(preferredGenres.slice(0, 2));
      const filteredGems = hiddenGems
        .filter(content => !excludeIds.includes(content.id))
        .slice(0, Math.ceil(limit * 0.3));
      
      allResults = [...allResults, ...filteredGems];
    }

    // Remove duplicates and limit results
    const uniqueResults = allResults
      .filter((content, index, self) => 
        index === self.findIndex(c => c.id === content.id)
      )
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, limit);

    return uniqueResults;
  } catch (error) {
    console.error('Error in personalized content search:', error);
    return [];
  }
};

// Utility function to chunk arrays
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};