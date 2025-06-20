import { useState, useEffect, useMemo } from 'react';
import { ContentItem } from '../types';
import { useUserProfile } from './useUserProfile';
import { useContent } from './useContent';
import { discoverContent, getMovieDetails, getTVShowDetails } from '../services/tmdbApi';

export interface PersonalizedRecommendation {
  content: ContentItem;
  score: number;
  confidence: number;
  reasons: string[];
  category: 'hidden_gem' | 'classic' | 'recent' | 'genre_match' | 'creator_match' | 'similar_users';
  releaseDecade?: string;
  isUnderrated?: boolean;
}

export interface RecommendationInsights {
  totalAnalyzed: number;
  hiddenGems: number;
  classics: number;
  genreMatches: number;
  creatorMatches: number;
  averageConfidence: number;
  topGenres: string[];
  recommendedDecades: string[];
}

// Expanded content discovery across all years
const DISCOVERY_YEARS = Array.from({ length: 50 }, (_, i) => 2024 - i); // 1974-2024
const CLASSIC_THRESHOLD_YEARS = 15; // Films older than 15 years
const HIDDEN_GEM_VOTE_THRESHOLD = 7.5; // High quality but potentially overlooked
const HIDDEN_GEM_POPULARITY_THRESHOLD = 50; // Lower popularity score

export const useAdvancedRecommendations = () => {
  const { profile, getTopGenres, getTopCreators } = useUserProfile();
  const { genres } = useContent();
  
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [insights, setInsights] = useState<RecommendationInsights | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<number>(0);

  // User preference analysis
  const userPreferences = useMemo(() => {
    const topGenres = getTopGenres(10);
    const topCreators = {
      actors: getTopCreators('actor', 10),
      directors: getTopCreators('director', 10),
      writers: getTopCreators('writer', 10)
    };

    // Analyze rating patterns
    const allRatings = [
      ...profile.ratings.map(r => ({ rating: r.rating * 10, timestamp: r.timestamp })),
      ...profile.detailedRatings.map(r => ({ rating: r.overall, timestamp: r.timestamp }))
    ];

    const averageRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
      : 50;

    // Analyze viewing frequency and recency
    const recentRatings = allRatings.filter(r => 
      Date.now() - r.timestamp < 90 * 24 * 60 * 60 * 1000 // Last 90 days
    );

    const viewingFrequency = recentRatings.length / 90; // Ratings per day

    // Analyze preferred content age
    const ratedContentIds = new Set([
      ...profile.ratings.map(r => r.contentId),
      ...profile.detailedRatings.map(r => r.contentId)
    ]);

    return {
      topGenres,
      topCreators,
      averageRating,
      viewingFrequency,
      totalRatings: allRatings.length,
      recentActivity: recentRatings.length,
      ratedContentIds,
      isActiveUser: recentRatings.length >= 5,
      preferredRatingRange: {
        min: Math.max(averageRating - 20, 0),
        max: Math.min(averageRating + 20, 100)
      }
    };
  }, [profile, getTopGenres, getTopCreators]);

  // Advanced content scoring algorithm
  const scoreContent = (content: ContentItem, category: string): PersonalizedRecommendation => {
    let score = 0;
    let confidence = 0.3;
    const reasons: string[] = [];

    // Base quality score
    const qualityScore = content.vote_average * 10;
    score += qualityScore * 0.3;

    // Genre preference matching
    const contentGenres = content.genre_ids || [];
    let genreScore = 0;
    let genreMatches = 0;

    contentGenres.forEach(genreId => {
      const preference = profile.genrePreferences[genreId];
      if (preference && preference > 6) {
        const genreBonus = (preference - 5) * 15;
        genreScore += genreBonus;
        genreMatches++;
        
        const genre = genres.find(g => g.id === genreId);
        if (genre) {
          reasons.push(`Sevdiğiniz ${genre.name} türünde`);
        }
      }
    });

    if (genreMatches > 0) {
      score += genreScore;
      confidence += Math.min(genreMatches * 0.15, 0.4);
    }

    // Release year and classic bonus
    const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const contentAge = currentYear - releaseYear;

    if (contentAge >= CLASSIC_THRESHOLD_YEARS) {
      score += 25; // Classic bonus
      confidence += 0.1;
      reasons.push('Zamansız klasik yapım');
    }

    // Hidden gem detection
    if (content.vote_average >= HIDDEN_GEM_VOTE_THRESHOLD && category === 'hidden_gem') {
      score += 30;
      confidence += 0.2;
      reasons.push('Gözden kaçmış kaliteli yapım');
    }

    // Decade preference (if user has patterns)
    const decade = Math.floor(releaseYear / 10) * 10;
    const userDecadePreference = getUserDecadePreference(decade);
    if (userDecadePreference > 0) {
      score += userDecadePreference * 10;
      confidence += 0.1;
      reasons.push(`${decade}'ler dönemi tercihinize uygun`);
    }

    // Rating alignment with user preferences
    const ratingAlignment = 100 - Math.abs(qualityScore - userPreferences.averageRating);
    score += ratingAlignment * 0.2;

    // Diversity bonus (avoid over-representation of same genres)
    const userGenreCounts = Object.values(profile.genrePreferences);
    if (genreMatches <= 2) {
      score += 10; // Bonus for genre diversity
    }

    // Recency penalty for very old content (unless user likes classics)
    if (contentAge > 30 && userPreferences.averageRating < 70) {
      score -= 15;
    }

    return {
      content,
      score: Math.max(0, score),
      confidence: Math.max(0.1, Math.min(1.0, confidence)),
      reasons: reasons.slice(0, 3),
      category: category as any,
      releaseDecade: `${decade}s`,
      isUnderrated: content.vote_average >= HIDDEN_GEM_VOTE_THRESHOLD && category === 'hidden_gem'
    };
  };

  // Analyze user's decade preferences based on ratings
  const getUserDecadePreference = (decade: number): number => {
    // This would analyze user's rating history for decade preferences
    // For now, return a neutral score
    return 0;
  };

  // Comprehensive content discovery
  const discoverPersonalizedContent = async (): Promise<PersonalizedRecommendation[]> => {
    const allRecommendations: PersonalizedRecommendation[] = [];
    const topGenreIds = userPreferences.topGenres.slice(0, 5).map(g => g.genreId);

    try {
      // 1. Hidden Gems Discovery (High quality, lower popularity)
      for (const year of DISCOVERY_YEARS.slice(0, 20)) { // Last 20 years
        const hiddenGems = await discoverContent({
          contentType: 'all',
          genreIds: topGenreIds,
          year: year.toString(),
          sortBy: 'rating',
          sortOrder: 'desc',
          page: 1
        });

        const filteredGems = hiddenGems
          .filter(content => 
            !userPreferences.ratedContentIds.has(content.id) &&
            content.vote_average >= HIDDEN_GEM_VOTE_THRESHOLD
          )
          .slice(0, 3);

        filteredGems.forEach(content => {
          const recommendation = scoreContent(content, 'hidden_gem');
          allRecommendations.push(recommendation);
        });
      }

      // 2. Classic Films Discovery (15+ years old, high rated)
      const classicYears = DISCOVERY_YEARS.filter(year => 
        new Date().getFullYear() - year >= CLASSIC_THRESHOLD_YEARS
      ).slice(0, 15);

      for (const year of classicYears) {
        const classics = await discoverContent({
          contentType: 'all',
          genreIds: topGenreIds,
          year: year.toString(),
          sortBy: 'rating',
          sortOrder: 'desc',
          page: 1
        });

        const filteredClassics = classics
          .filter(content => 
            !userPreferences.ratedContentIds.has(content.id) &&
            content.vote_average >= 7.0
          )
          .slice(0, 2);

        filteredClassics.forEach(content => {
          const recommendation = scoreContent(content, 'classic');
          allRecommendations.push(recommendation);
        });
      }

      // 3. Genre-based Discovery (All time periods)
      for (const genreData of userPreferences.topGenres.slice(0, 3)) {
        const genreContent = await discoverContent({
          contentType: 'all',
          genreIds: [genreData.genreId],
          sortBy: 'rating',
          sortOrder: 'desc',
          page: Math.floor(Math.random() * 5) + 1 // Random page for variety
        });

        const filteredGenreContent = genreContent
          .filter(content => 
            !userPreferences.ratedContentIds.has(content.id) &&
            content.vote_average >= 6.5
          )
          .slice(0, 5);

        filteredGenreContent.forEach(content => {
          const recommendation = scoreContent(content, 'genre_match');
          allRecommendations.push(recommendation);
        });
      }

      // 4. Recent Quality Content (Last 3 years)
      const recentYears = [2024, 2023, 2022];
      for (const year of recentYears) {
        const recentContent = await discoverContent({
          contentType: 'all',
          genreIds: topGenreIds,
          year: year.toString(),
          sortBy: 'rating',
          sortOrder: 'desc',
          page: 1
        });

        const filteredRecent = recentContent
          .filter(content => 
            !userPreferences.ratedContentIds.has(content.id) &&
            content.vote_average >= 7.0
          )
          .slice(0, 4);

        filteredRecent.forEach(content => {
          const recommendation = scoreContent(content, 'recent');
          allRecommendations.push(recommendation);
        });
      }

      // Remove duplicates and sort by score
      const uniqueRecommendations = allRecommendations
        .filter((rec, index, self) => 
          index === self.findIndex(r => r.content.id === rec.content.id)
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 50); // Top 50 recommendations

      return uniqueRecommendations;

    } catch (error) {
      console.error('Error discovering personalized content:', error);
      return [];
    }
  };

  // Generate insights from recommendations
  const generateInsights = (recommendations: PersonalizedRecommendation[]): RecommendationInsights => {
    const categoryCounts = recommendations.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgConfidence = recommendations.length > 0
      ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
      : 0;

    const topGenres = userPreferences.topGenres.slice(0, 5).map(g => {
      const genre = genres.find(genre => genre.id === g.genreId);
      return genre?.name || 'Unknown';
    });

    const decades = [...new Set(recommendations.map(rec => rec.releaseDecade).filter(Boolean))]
      .slice(0, 5);

    return {
      totalAnalyzed: recommendations.length,
      hiddenGems: categoryCounts.hidden_gem || 0,
      classics: categoryCounts.classic || 0,
      genreMatches: categoryCounts.genre_match || 0,
      creatorMatches: categoryCounts.creator_match || 0,
      averageConfidence: avgConfidence * 100,
      topGenres,
      recommendedDecades: decades
    };
  };

  // Main analysis function
  const analyzeAndRecommend = async () => {
    if (userPreferences.totalRatings < 3) {
      setRecommendations([]);
      setInsights(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const personalizedRecs = await discoverPersonalizedContent();
      const analysisInsights = generateInsights(personalizedRecs);
      
      setRecommendations(personalizedRecs);
      setInsights(analysisInsights);
      setLastAnalysis(Date.now());
    } catch (error) {
      console.error('Error in analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when user profile changes significantly
  useEffect(() => {
    const shouldAnalyze = 
      userPreferences.totalRatings >= 3 && 
      (Date.now() - lastAnalysis > 5 * 60 * 1000 || // 5 minutes
       recommendations.length === 0);

    if (shouldAnalyze) {
      const timeoutId = setTimeout(analyzeAndRecommend, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [userPreferences.totalRatings, profile.genrePreferences]);

  // Get recommendations by category
  const getRecommendationsByCategory = (category: string) => {
    return recommendations.filter(rec => rec.category === category);
  };

  // Get recommendations by decade
  const getRecommendationsByDecade = (decade: string) => {
    return recommendations.filter(rec => rec.releaseDecade === decade);
  };

  return {
    recommendations,
    insights,
    isAnalyzing,
    lastAnalysis,
    userPreferences,
    analyzeAndRecommend,
    getRecommendationsByCategory,
    getRecommendationsByDecade,
    hasEnoughData: userPreferences.totalRatings >= 3
  };
};