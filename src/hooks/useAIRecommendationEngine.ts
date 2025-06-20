import { useState, useEffect, useMemo } from 'react';
import { ContentItem } from '../types';
import { useUserProfile } from './useUserProfile';
import { useContent } from './useContent';

export interface AIRecommendationStats {
  totalUsers: number;
  totalRatings: number;
  currentUserRatings: number;
  averageRating: number;
  modelAccuracy: number;
  lastTrainingDate: string;
}

export interface UserSimilarity {
  userId: string;
  similarity: number;
  commonRatings: number;
}

export interface RecommendationScore {
  contentId: number;
  score: number;
  confidence: number;
  reasons: string[];
}

// Simulated user data for collaborative filtering
const generateSimulatedUsers = () => {
  const users: { [userId: string]: { [contentId: number]: number } } = {};
  const userIds = Array.from({ length: 50 }, (_, i) => `sim_user_${i + 1}`);
  const contentIds = Array.from({ length: 100 }, (_, i) => i + 1);

  userIds.forEach(userId => {
    users[userId] = {};
    // Each user rates 15-30 random items
    const numRatings = Math.floor(Math.random() * 16) + 15;
    const shuffledContent = [...contentIds].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numRatings; i++) {
      const contentId = shuffledContent[i];
      // Generate realistic rating distribution (more 3-5 stars)
      const rating = Math.random() < 0.7 
        ? Math.floor(Math.random() * 3) + 3  // 3-5 stars (70%)
        : Math.floor(Math.random() * 2) + 1; // 1-2 stars (30%)
      
      users[userId][contentId] = rating;
    }
  });

  return users;
};

export const useAIRecommendationEngine = () => {
  const { profile, getTopGenres } = useUserProfile();
  const { trendingMovies, trendingTVShows, genres } = useContent();
  
  const [simulatedUsers] = useState(() => generateSimulatedUsers());
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Convert user profile to rating matrix format
  const currentUserRatings = useMemo(() => {
    const ratings: { [contentId: number]: number } = {};
    
    // Add simple ratings
    profile.ratings.forEach(rating => {
      ratings[rating.contentId] = rating.rating;
    });
    
    // Add detailed ratings (convert 0-100 to 1-5 scale)
    profile.detailedRatings.forEach(rating => {
      ratings[rating.contentId] = rating.overall / 20; // 0-100 to 0-5, then we'll adjust
    });
    
    return ratings;
  }, [profile.ratings, profile.detailedRatings]);

  // Calculate user similarity using Pearson correlation
  const calculateUserSimilarity = (user1Ratings: { [contentId: number]: number }, user2Ratings: { [contentId: number]: number }): number => {
    const commonItems = Object.keys(user1Ratings)
      .filter(contentId => contentId in user2Ratings)
      .map(id => parseInt(id));

    if (commonItems.length < 2) return 0;

    const sum1 = commonItems.reduce((sum, id) => sum + user1Ratings[id], 0);
    const sum2 = commonItems.reduce((sum, id) => sum + user2Ratings[id], 0);
    
    const sum1Sq = commonItems.reduce((sum, id) => sum + Math.pow(user1Ratings[id], 2), 0);
    const sum2Sq = commonItems.reduce((sum, id) => sum + Math.pow(user2Ratings[id], 2), 0);
    
    const pSum = commonItems.reduce((sum, id) => sum + user1Ratings[id] * user2Ratings[id], 0);
    
    const num = pSum - (sum1 * sum2 / commonItems.length);
    const den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / commonItems.length) * 
                         (sum2Sq - Math.pow(sum2, 2) / commonItems.length));
    
    if (den === 0) return 0;
    return num / den;
  };

  // Find similar users
  const findSimilarUsers = (): UserSimilarity[] => {
    if (Object.keys(currentUserRatings).length < 3) return [];

    const similarities: UserSimilarity[] = [];
    
    Object.entries(simulatedUsers).forEach(([userId, userRatings]) => {
      const similarity = calculateUserSimilarity(currentUserRatings, userRatings);
      const commonRatings = Object.keys(currentUserRatings)
        .filter(contentId => contentId in userRatings).length;
      
      if (similarity > 0.1 && commonRatings >= 2) {
        similarities.push({
          userId,
          similarity,
          commonRatings
        });
      }
    });

    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  };

  // Generate content-based recommendations using genre preferences
  const generateContentBasedRecommendations = (): RecommendationScore[] => {
    const allContent = [...trendingMovies, ...trendingTVShows];
    const ratedContentIds = new Set(Object.keys(currentUserRatings).map(id => parseInt(id)));
    const topGenres = getTopGenres(5);
    
    if (topGenres.length === 0) return [];

    const recommendations: RecommendationScore[] = [];
    
    allContent.forEach(content => {
      if (ratedContentIds.has(content.id)) return;
      
      let score = content.vote_average * 10; // Base score from TMDB rating
      let confidence = 0.3; // Base confidence
      const reasons: string[] = [];
      
      // Genre preference scoring
      const contentGenres = content.genre_ids || [];
      let genreScore = 0;
      let genreMatches = 0;
      
      contentGenres.forEach(genreId => {
        const preference = profile.genrePreferences[genreId];
        if (preference && preference > 6) {
          genreScore += (preference - 5) * 15;
          genreMatches++;
          const genre = genres.find(g => g.id === genreId);
          if (genre) reasons.push(`You love ${genre.name}`);
        }
      });
      
      if (genreMatches > 0) {
        score += genreScore;
        confidence += Math.min(genreMatches * 0.2, 0.4);
      }
      
      // Boost for high-rated content
      if (content.vote_average >= 8.0) {
        score += 20;
        confidence += 0.1;
        reasons.push('Critically acclaimed');
      } else if (content.vote_average >= 7.0) {
        score += 10;
        confidence += 0.05;
        reasons.push('Well-rated');
      }
      
      // Recent content boost
      const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
      const currentYear = new Date().getFullYear();
      if (releaseYear >= currentYear - 1) {
        score += 15;
        reasons.push('Recent release');
      }
      
      // Diversity penalty for over-represented genres
      const userGenreCounts = Object.values(profile.genrePreferences);
      const avgGenrePreference = userGenreCounts.length > 0 
        ? userGenreCounts.reduce((sum, pref) => sum + pref, 0) / userGenreCounts.length 
        : 5;
      
      if (genreMatches > 2) {
        score -= 10; // Slight penalty for too many matching genres
        confidence -= 0.1;
      }
      
      recommendations.push({
        contentId: content.id,
        score: Math.max(0, score),
        confidence: Math.max(0.1, Math.min(1.0, confidence)),
        reasons: reasons.slice(0, 3) // Limit to top 3 reasons
      });
    });
    
    return recommendations.sort((a, b) => b.score - a.score);
  };

  // Generate collaborative filtering recommendations
  const generateCollaborativeRecommendations = (): RecommendationScore[] => {
    const similarUsers = findSimilarUsers();
    if (similarUsers.length === 0) return [];
    
    const recommendations: { [contentId: number]: { score: number; voters: number; reasons: Set<string> } } = {};
    const ratedContentIds = new Set(Object.keys(currentUserRatings).map(id => parseInt(id)));
    
    similarUsers.forEach(({ userId, similarity, commonRatings }) => {
      const userRatings = simulatedUsers[userId];
      
      Object.entries(userRatings).forEach(([contentIdStr, rating]) => {
        const contentId = parseInt(contentIdStr);
        if (ratedContentIds.has(contentId) || rating < 3.5) return;
        
        if (!recommendations[contentId]) {
          recommendations[contentId] = { score: 0, voters: 0, reasons: new Set() };
        }
        
        const weightedScore = rating * similarity;
        recommendations[contentId].score += weightedScore;
        recommendations[contentId].voters += 1;
        
        if (similarity > 0.7) {
          recommendations[contentId].reasons.add('Highly similar users loved this');
        } else if (similarity > 0.5) {
          recommendations[contentId].reasons.add('Similar users enjoyed this');
        } else {
          recommendations[contentId].reasons.add('Recommended by similar tastes');
        }
      });
    });
    
    return Object.entries(recommendations)
      .map(([contentIdStr, data]) => ({
        contentId: parseInt(contentIdStr),
        score: data.score / Math.max(data.voters, 1),
        confidence: Math.min(data.voters * 0.2, 0.8),
        reasons: Array.from(data.reasons).slice(0, 2)
      }))
      .sort((a, b) => b.score - a.score);
  };

  // Hybrid recommendation system
  const generateHybridRecommendations = (): RecommendationScore[] => {
    const contentBased = generateContentBasedRecommendations();
    const collaborative = generateCollaborativeRecommendations();
    
    // Merge recommendations
    const hybridMap: { [contentId: number]: RecommendationScore } = {};
    
    // Add content-based recommendations
    contentBased.forEach(rec => {
      hybridMap[rec.contentId] = {
        ...rec,
        score: rec.score * 0.6, // 60% weight for content-based
        reasons: [...rec.reasons]
      };
    });
    
    // Add collaborative recommendations
    collaborative.forEach(rec => {
      if (hybridMap[rec.contentId]) {
        // Combine scores
        hybridMap[rec.contentId].score += rec.score * 0.4; // 40% weight for collaborative
        hybridMap[rec.contentId].confidence = Math.max(
          hybridMap[rec.contentId].confidence,
          rec.confidence
        );
        hybridMap[rec.contentId].reasons = [
          ...hybridMap[rec.contentId].reasons,
          ...rec.reasons
        ].slice(0, 3);
      } else {
        hybridMap[rec.contentId] = {
          ...rec,
          score: rec.score * 0.4
        };
      }
    });
    
    return Object.values(hybridMap)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  };

  // Update recommendations when profile changes
  useEffect(() => {
    if (Object.keys(currentUserRatings).length === 0) {
      setRecommendations([]);
      return;
    }

    const updateRecommendations = async () => {
      setIsTraining(true);
      
      // Simulate training delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRecommendations = generateHybridRecommendations();
      setRecommendations(newRecommendations);
      setLastUpdate(Date.now());
      setIsTraining(false);
    };

    // Debounce updates
    const timeoutId = setTimeout(updateRecommendations, 500);
    return () => clearTimeout(timeoutId);
  }, [currentUserRatings, profile.genrePreferences]);

  // Get recommended content with details
  const getRecommendedContent = (): ContentItem[] => {
    const allContent = [...trendingMovies, ...trendingTVShows];
    
    return recommendations
      .map(rec => allContent.find(content => content.id === rec.contentId))
      .filter(Boolean) as ContentItem[];
  };

  // Get AI stats
  const getAIStats = (): AIRecommendationStats => {
    const totalSimulatedRatings = Object.values(simulatedUsers)
      .reduce((total, userRatings) => total + Object.keys(userRatings).length, 0);
    
    const currentUserRatingCount = Object.keys(currentUserRatings).length;
    const allRatings = [...Object.values(currentUserRatings), ...Object.values(simulatedUsers).flatMap(ur => Object.values(ur))];
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
      : 0;

    // Calculate model accuracy based on confidence scores
    const avgConfidence = recommendations.length > 0
      ? recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length
      : 0;

    return {
      totalUsers: Object.keys(simulatedUsers).length + 1, // +1 for current user
      totalRatings: totalSimulatedRatings + currentUserRatingCount,
      currentUserRatings: currentUserRatingCount,
      averageRating: avgRating,
      modelAccuracy: avgConfidence * 100,
      lastTrainingDate: lastUpdate > 0 ? new Date(lastUpdate).toLocaleString() : 'Never'
    };
  };

  // Get recommendation explanation
  const getRecommendationExplanation = (contentId: number): string[] => {
    const rec = recommendations.find(r => r.contentId === contentId);
    return rec ? rec.reasons : [];
  };

  // Force retrain model
  const retrainModel = async () => {
    setIsTraining(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate longer training
    
    const newRecommendations = generateHybridRecommendations();
    setRecommendations(newRecommendations);
    setLastUpdate(Date.now());
    setIsTraining(false);
  };

  return {
    recommendations: getRecommendedContent(),
    recommendationScores: recommendations,
    isTraining,
    lastUpdate,
    getAIStats,
    getRecommendationExplanation,
    retrainModel,
    findSimilarUsers,
    hasEnoughData: Object.keys(currentUserRatings).length >= 3
  };
};