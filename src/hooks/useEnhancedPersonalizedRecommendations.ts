import { useState, useEffect, useMemo } from 'react';
import { ContentItem } from '../types';
import { useUserProfile } from './useUserProfile';
import { useContent } from './useContent';
import { discoverPersonalizedContent, getContentVideos } from '../services/tmdbApi';

export interface EnhancedPersonalizedRecommendation {
  content: ContentItem;
  matchScore: number;
  confidence: number;
  reasons: string[];
  category: 'genre_match' | 'decade_match' | 'quality_match' | 'discovery' | 'hidden_gem';
  releaseDecade: string;
  trailerKey?: string;
  explanation: string;
}

export interface MatchScoreBreakdown {
  genreMatch: number; // 40%
  qualityMatch: number; // 30%
  decadeMatch: number; // 20%
  diversityFactor: number; // 10%
  total: number;
}

export interface RecommendationFilters {
  contentType: 'all' | 'movie' | 'tv';
  genres: number[];
  decades: string[];
  minMatchScore: number;
  sortBy: 'match_score' | 'rating' | 'release_date';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: RecommendationFilters = {
  contentType: 'all',
  genres: [],
  decades: [],
  minMatchScore: 60, // Minimum 60% match score
  sortBy: 'match_score',
  sortOrder: 'desc'
};

// Helper function to get decade from year
const getDecadeFromYear = (year: number): string => {
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
};

// Helper function to get year range for decade
const getYearRangeForDecade = (decade: string): { start: number; end: number } => {
  const decadeNum = parseInt(decade.replace('s', ''));
  return { start: decadeNum, end: decadeNum + 9 };
};

export const useEnhancedPersonalizedRecommendations = () => {
  const { profile, getTopGenres } = useUserProfile();
  const { genres } = useContent();
  
  const [recommendations, setRecommendations] = useState<EnhancedPersonalizedRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS);

  // Get rated content IDs to exclude
  const ratedContentIds = useMemo(() => {
    return new Set([
      ...profile.ratings.map(r => r.contentId),
      ...profile.detailedRatings.map(r => r.contentId)
    ]);
  }, [profile.ratings, profile.detailedRatings]);

  // Analyze user preferences
  const userPreferences = useMemo(() => {
    const allRatings = [
      ...profile.ratings.map(r => ({ rating: r.rating * 10, contentType: r.contentType })),
      ...profile.detailedRatings.map(r => ({ rating: r.overall, contentType: r.contentType }))
    ];

    if (allRatings.length === 0) {
      return {
        averageRating: 70,
        preferredGenres: [],
        contentTypePreference: { movie: 50, tv: 50 },
        qualityThreshold: 6.0,
        totalRatings: 0
      };
    }

    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    const movieCount = allRatings.filter(r => r.contentType === 'movie').length;
    const tvCount = allRatings.filter(r => r.contentType === 'tv').length;
    const total = movieCount + tvCount;

    const topGenres = getTopGenres(8);
    const qualityThreshold = Math.max(6.0, (averageRating / 10) - 1);

    return {
      averageRating,
      preferredGenres: topGenres,
      contentTypePreference: {
        movie: total > 0 ? (movieCount / total) * 100 : 50,
        tv: total > 0 ? (tvCount / total) * 100 : 50
      },
      qualityThreshold,
      totalRatings: allRatings.length
    };
  }, [profile, getTopGenres]);

  // Calculate match score for content
  const calculateMatchScore = (content: ContentItem): MatchScoreBreakdown => {
    const contentGenres = content.genre_ids || [];
    const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const contentAge = currentYear - releaseYear;

    // 1. Genre Match (40%)
    let genreMatchScore = 0;
    let genreMatches = 0;
    
    contentGenres.forEach(genreId => {
      const preference = profile.genrePreferences[genreId];
      if (preference && preference > 5) {
        genreMatchScore += ((preference - 5) / 5) * 100;
        genreMatches++;
      }
    });
    
    const genreMatch = genreMatches > 0 ? Math.min(genreMatchScore / genreMatches, 100) : 0;

    // 2. Quality Match (30%)
    const userAvgRating = userPreferences.averageRating / 10;
    const contentRating = content.vote_average;
    const qualityDifference = Math.abs(userAvgRating - contentRating);
    const qualityMatch = Math.max(0, 100 - (qualityDifference * 20));

    // 3. Decade Match (20%)
    let decadeMatch = 50; // Base score
    
    // Analyze user's decade preferences based on ratings
    const userRatedYears = [
      ...profile.ratings.map(r => {
        // This would need content data to get actual years
        // For now, give bonus to recent content
        return currentYear - Math.floor(Math.random() * 20);
      })
    ];
    
    if (contentAge <= 5) {
      decadeMatch = 90; // Recent content bonus
    } else if (contentAge <= 15) {
      decadeMatch = 70; // Modern content
    } else if (contentAge <= 25) {
      decadeMatch = 60; // Classic content
    } else {
      decadeMatch = 40; // Very old content
    }

    // 4. Diversity Factor (10%)
    const diversityFactor = contentGenres.length <= 3 ? 80 : 60; // Prefer focused content

    // Calculate weighted total
    const total = (genreMatch * 0.4) + (qualityMatch * 0.3) + (decadeMatch * 0.2) + (diversityFactor * 0.1);

    return {
      genreMatch,
      qualityMatch,
      decadeMatch,
      diversityFactor,
      total: Math.round(total)
    };
  };

  // Generate explanation for recommendation
  const generateExplanation = (content: ContentItem, matchScore: MatchScoreBreakdown): string => {
    const explanations: string[] = [];
    
    if (matchScore.genreMatch > 70) {
      const contentGenres = content.genre_ids || [];
      const matchedGenres = contentGenres
        .filter(genreId => profile.genrePreferences[genreId] > 6)
        .map(genreId => genres.find(g => g.id === genreId)?.name)
        .filter(Boolean)
        .slice(0, 2);
      
      if (matchedGenres.length > 0) {
        explanations.push(`${matchedGenres.join(' ve ')} türlerini seviyorsunuz`);
      }
    }

    if (matchScore.qualityMatch > 80) {
      explanations.push('kalite beklentinize uygun');
    }

    if (matchScore.decadeMatch > 80) {
      const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
      const currentYear = new Date().getFullYear();
      const contentAge = currentYear - releaseYear;
      
      if (contentAge <= 5) {
        explanations.push('güncel yapım');
      } else if (contentAge <= 15) {
        explanations.push('modern dönem tercihinize uygun');
      }
    }

    if (content.vote_average >= 8.0) {
      explanations.push('yüksek puanlı kaliteli yapım');
    }

    return explanations.length > 0 
      ? `Bu içerik öneriliyor çünkü ${explanations.join(', ')}.`
      : 'Genel tercihlerinize uygun bir içerik.';
  };

  // Discover personalized content with enhanced scoring
  const discoverEnhancedContent = async (): Promise<EnhancedPersonalizedRecommendation[]> => {
    if (userPreferences.totalRatings < 3) {
      return [];
    }

    const allRecommendations: EnhancedPersonalizedRecommendation[] = [];
    const topGenreIds = userPreferences.preferredGenres.slice(0, 5).map(g => g.genreId);

    try {
      // 1. Genre-based discovery
      for (const genreData of userPreferences.preferredGenres.slice(0, 3)) {
        const genreContent = await discoverPersonalizedContent({
          contentType: filters.contentType === 'all' ? 'all' : filters.contentType,
          genreIds: [genreData.genreId],
          minRating: userPreferences.qualityThreshold,
          excludeIds: Array.from(ratedContentIds),
          page: Math.floor(Math.random() * 3) + 1
        });

        for (const content of genreContent.slice(0, 8)) {
          const matchScore = calculateMatchScore(content);
          
          if (matchScore.total >= filters.minMatchScore) {
            // Get trailer
            const videos = await getContentVideos(content.id, 'title' in content ? 'movie' : 'tv');
            const trailer = videos.find(v => v.type === 'Trailer') || videos[0];

            const recommendation: EnhancedPersonalizedRecommendation = {
              content,
              matchScore: matchScore.total,
              confidence: Math.min(matchScore.total / 100, 0.95),
              reasons: [
                `${matchScore.genreMatch.toFixed(0)}% tür uyumu`,
                `${matchScore.qualityMatch.toFixed(0)}% kalite eşleşmesi`,
                `${matchScore.decadeMatch.toFixed(0)}% dönem uyumu`
              ],
              category: matchScore.genreMatch > 70 ? 'genre_match' : 'discovery',
              releaseDecade: getDecadeFromYear(new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear()),
              trailerKey: trailer?.key,
              explanation: generateExplanation(content, matchScore)
            };

            allRecommendations.push(recommendation);
          }
        }
      }

      // 2. Quality-based discovery (high-rated content)
      const qualityContent = await discoverPersonalizedContent({
        contentType: filters.contentType === 'all' ? 'all' : filters.contentType,
        genreIds: topGenreIds,
        minRating: 7.5,
        maxRating: 10.0,
        excludeIds: Array.from(ratedContentIds),
        sortBy: 'rating'
      });

      for (const content of qualityContent.slice(0, 10)) {
        const matchScore = calculateMatchScore(content);
        
        if (matchScore.total >= filters.minMatchScore) {
          const videos = await getContentVideos(content.id, 'title' in content ? 'movie' : 'tv');
          const trailer = videos.find(v => v.type === 'Trailer') || videos[0];

          const recommendation: EnhancedPersonalizedRecommendation = {
            content,
            matchScore: matchScore.total,
            confidence: Math.min(matchScore.total / 100, 0.95),
            reasons: [
              `${matchScore.qualityMatch.toFixed(0)}% kalite eşleşmesi`,
              `${matchScore.genreMatch.toFixed(0)}% tür uyumu`,
              'yüksek puanlı yapım'
            ],
            category: 'quality_match',
            releaseDecade: getDecadeFromYear(new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear()),
            trailerKey: trailer?.key,
            explanation: generateExplanation(content, matchScore)
          };

          allRecommendations.push(recommendation);
        }
      }

      // 3. Decade-based discovery
      const currentYear = new Date().getFullYear();
      const decades = [
        { start: currentYear - 5, end: currentYear },
        { start: 2010, end: 2019 },
        { start: 2000, end: 2009 },
        { start: 1990, end: 1999 }
      ];

      for (const decade of decades.slice(0, 2)) {
        const decadeContent = await discoverPersonalizedContent({
          contentType: filters.contentType === 'all' ? 'all' : filters.contentType,
          genreIds: topGenreIds.slice(0, 3),
          yearRange: decade,
          minRating: userPreferences.qualityThreshold,
          excludeIds: Array.from(ratedContentIds)
        });

        for (const content of decadeContent.slice(0, 6)) {
          const matchScore = calculateMatchScore(content);
          
          if (matchScore.total >= filters.minMatchScore) {
            const videos = await getContentVideos(content.id, 'title' in content ? 'movie' : 'tv');
            const trailer = videos.find(v => v.type === 'Trailer') || videos[0];

            const recommendation: EnhancedPersonalizedRecommendation = {
              content,
              matchScore: matchScore.total,
              confidence: Math.min(matchScore.total / 100, 0.95),
              reasons: [
                `${matchScore.decadeMatch.toFixed(0)}% dönem uyumu`,
                `${matchScore.genreMatch.toFixed(0)}% tür uyumu`,
                `${decade.start}-${decade.end} dönemi`
              ],
              category: 'decade_match',
              releaseDecade: getDecadeFromYear(new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear()),
              trailerKey: trailer?.key,
              explanation: generateExplanation(content, matchScore)
            };

            allRecommendations.push(recommendation);
          }
        }
      }

      // Remove duplicates and sort by match score
      const uniqueRecommendations = allRecommendations
        .filter((rec, index, self) => 
          index === self.findIndex(r => r.content.id === rec.content.id)
        )
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 50);

      return uniqueRecommendations;

    } catch (error) {
      console.error('Error discovering enhanced content:', error);
      return [];
    }
  };

  // Apply filters to recommendations
  const getFilteredRecommendations = () => {
    let filtered = [...recommendations];

    // Content type filter
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(rec => {
        const isMovie = 'title' in rec.content;
        return filters.contentType === 'movie' ? isMovie : !isMovie;
      });
    }

    // Genre filter
    if (filters.genres.length > 0) {
      filtered = filtered.filter(rec => 
        rec.content.genre_ids?.some(genreId => filters.genres.includes(genreId))
      );
    }

    // Decade filter
    if (filters.decades.length > 0) {
      filtered = filtered.filter(rec => 
        filters.decades.includes(rec.releaseDecade)
      );
    }

    // Match score filter
    filtered = filtered.filter(rec => rec.matchScore >= filters.minMatchScore);

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'match_score':
          aValue = a.matchScore;
          bValue = b.matchScore;
          break;
        case 'rating':
          aValue = a.content.vote_average;
          bValue = b.content.vote_average;
          break;
        case 'release_date':
          aValue = new Date('release_date' in a.content ? a.content.release_date : a.content.first_air_date).getTime();
          bValue = new Date('release_date' in b.content ? b.content.release_date : b.content.first_air_date).getTime();
          break;
        default:
          return 0;
      }

      return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  };

  // Main analysis function
  const analyzeAndRecommend = async () => {
    if (userPreferences.totalRatings < 3) {
      setRecommendations([]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const enhancedRecs = await discoverEnhancedContent();
      setRecommendations(enhancedRecs);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error in enhanced analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when user profile changes
  useEffect(() => {
    const shouldAnalyze = 
      userPreferences.totalRatings >= 3 && 
      (Date.now() - lastUpdate > 3 * 60 * 1000 || recommendations.length === 0);

    if (shouldAnalyze) {
      const timeoutId = setTimeout(analyzeAndRecommend, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [userPreferences.totalRatings, profile.genrePreferences]);

  // Get recommendations by category
  const getRecommendationsByCategory = (category: string) => {
    return recommendations.filter(rec => rec.category === category);
  };

  return {
    recommendations: getFilteredRecommendations(),
    allRecommendations: recommendations,
    userPreferences,
    isAnalyzing,
    lastUpdate,
    filters,
    setFilters,
    analyzeAndRecommend,
    getRecommendationsByCategory,
    hasEnoughData: userPreferences.totalRatings >= 3,
    ratedContentIds
  };
};