import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Target, TrendingUp, RefreshCw, Sparkles, Clock, Heart, Star, Film, Tv, Users, Calendar } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';
import { MovieCard } from './MovieCard';
import { ContentItem } from '../types';

export const RecommendationEngine: React.FC = () => {
  const { profile, getTopGenres, getTopCreators, addRating, addDetailedRating } = useUserProfile();
  const { genres, getRecommendedContent, loading: contentLoading } = useContent();
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'genre' | 'creator' | 'trending'>('all');

  const topGenres = useMemo(() => {
    const topGenreData = getTopGenres(5);
    return topGenreData.map(({ genreId, score }) => ({
      genre: genres.find(g => g.id === genreId),
      score
    })).filter(item => item.genre);
  }, [getTopGenres, genres]);

  const topCreators = useMemo(() => {
    return {
      actors: getTopCreators('actor', 3),
      directors: getTopCreators('director', 3),
      writers: getTopCreators('writer', 3)
    };
  }, [getTopCreators]);

  // Get all rated content IDs to exclude from recommendations
  const ratedContentIds = useMemo(() => {
    return new Set([
      ...profile.ratings.map(r => r.contentId),
      ...profile.detailedRatings.map(r => r.contentId)
    ]);
  }, [profile.ratings, profile.detailedRatings]);

  // Calculate user's rating patterns
  const userInsights = useMemo(() => {
    const allRatings = [
      ...profile.ratings.map(r => ({ rating: r.rating * 10, timestamp: r.timestamp })),
      ...profile.detailedRatings.map(r => ({ rating: r.overall, timestamp: r.timestamp }))
    ];

    const recentRatings = allRatings.filter(r => 
      Date.now() - r.timestamp < 30 * 24 * 60 * 60 * 1000 // Last 30 days
    );

    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
      : 50;

    const recentAvgRating = recentRatings.length > 0
      ? recentRatings.reduce((sum, r) => sum + r.rating, 0) / recentRatings.length
      : avgRating;

    return {
      totalRatings: allRatings.length,
      averageRating: avgRating,
      recentAverageRating: recentAvgRating,
      isActiveUser: recentRatings.length >= 3,
      ratingTrend: recentAvgRating > avgRating ? 'improving' : recentAvgRating < avgRating ? 'declining' : 'stable'
    };
  }, [profile.ratings, profile.detailedRatings]);

  // Load personalized recommendations
  const loadRecommendations = async () => {
    if (contentLoading) return;
    
    setLoading(true);
    try {
      let recommendedContent: ContentItem[] = [];

      if (userInsights.totalRatings === 0) {
        // New user - show trending content
        recommendedContent = await getRecommendedContent([], 16);
      } else {
        // Experienced user - personalized recommendations
        const topGenreIds = topGenres.slice(0, 3).map(tg => tg.genre!.id);
        
        // Get content based on top genres
        const genreBasedContent = await getRecommendedContent(topGenreIds, 20);
        
        // Score content based on multiple factors
        const scoredContent = genreBasedContent.map(content => {
          let score = content.vote_average * 10; // Base score from TMDB rating
          
          // Boost for preferred genres
          content.genre_ids.forEach(genreId => {
            const preference = profile.genrePreferences[genreId];
            if (preference && preference > 6) {
              score += (preference - 6) * 15; // Strong boost for highly preferred genres
            } else if (preference && preference < 4) {
              score -= (4 - preference) * 10; // Penalty for disliked genres
            }
          });

          // Boost newer content if user likes recent releases
          const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
          const currentYear = new Date().getFullYear();
          if (releaseYear >= currentYear - 1) {
            score += 10; // Boost for very recent content
          } else if (releaseYear >= currentYear - 3) {
            score += 5; // Smaller boost for recent content
          }

          // Boost content with higher vote counts (more reliable ratings)
          if (content.vote_average >= 7.5) {
            score += 15;
          } else if (content.vote_average >= 6.5) {
            score += 8;
          }

          // Penalize content that's too similar to recently rated content
          const hasRecentSimilarRating = profile.ratings
            .filter(r => Date.now() - r.timestamp < 7 * 24 * 60 * 60 * 1000) // Last week
            .some(r => {
              // Check if genres overlap significantly
              const ratedContent = genreBasedContent.find(c => c.id === r.contentId);
              if (ratedContent) {
                const overlap = content.genre_ids.filter(id => ratedContent.genre_ids.includes(id)).length;
                return overlap >= 2; // 2+ shared genres
              }
              return false;
            });

          if (hasRecentSimilarRating) {
            score -= 20; // Reduce score for similar content
          }

          return { ...content, recommendationScore: score };
        });

        recommendedContent = scoredContent
          .filter(content => !ratedContentIds.has(content.id)) // Exclude rated content
          .sort((a, b) => b.recommendationScore - a.recommendationScore)
          .slice(0, 16);
      }

      setRecommendations(recommendedContent);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [profile.genrePreferences, profile.ratings, profile.detailedRatings, genres, contentLoading]);

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    addRating(contentId, contentType, rating, genreIds);
    // Remove rated content from recommendations
    setRecommendations(prev => prev.filter(content => content.id !== contentId));
    // Reload recommendations after a short delay
    setTimeout(loadRecommendations, 1000);
  };

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
    // Remove rated content from recommendations
    setRecommendations(prev => prev.filter(content => content.id !== detailedRating.contentId));
    // Reload recommendations after a short delay
    setTimeout(loadRecommendations, 1000);
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // New user experience
  if (userInsights.totalRatings === 0) {
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-3 rounded-full border border-blue-500/30">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="text-blue-400 font-semibold">Welcome to CineMatch</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Discover Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Entertainment Match
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Start by rating a few movies and TV shows to unlock personalized recommendations. 
            The more you rate, the better our suggestions become.
          </p>
        </div>

        {/* Trending Content for New Users */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-7 h-7 text-blue-400" />
              <span>Start with Trending Content</span>
            </h2>
            <div className="text-sm text-gray-400">
              Rate these to get started
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-400">Loading trending content...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((content) => (
                <MovieCard
                  key={content.id}
                  content={content}
                  onRate={(rating) => handleRate(
                    content.id, 
                    'title' in content ? 'movie' : 'tv', 
                    rating, 
                    content.genre_ids
                  )}
                  onDetailedRate={handleDetailedRate}
                  showRating={true}
                  showDetailedRating={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Experienced user experience
  return (
    <div className="space-y-8">
      {/* Personalized Header */}
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-3 rounded-full border border-blue-500/30">
          <Zap className="w-6 h-6 text-blue-400" />
          <span className="text-blue-400 font-semibold">Personalized For You</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Perfect Matches Based on Your Taste
        </h2>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300">
              {userInsights.totalRatings} ratings • {userInsights.averageRating.toFixed(1)} avg
            </span>
          </div>
          
          {topGenres.length > 0 && (
            <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-full">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-gray-300">
                Loves {topGenres.slice(0, 2).map(g => g.genre?.name).join(' & ')}
              </span>
            </div>
          )}
          
          {userInsights.isActiveUser && (
            <div className="flex items-center space-x-2 bg-green-600/20 px-4 py-2 rounded-full border border-green-500/30">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Active Rater</span>
            </div>
          )}
        </div>

        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="inline-flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Recommendations</span>
        </button>
      </div>

      {/* User Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-white">Taste Profile</span>
            </div>
          </div>
          <div className="space-y-2">
            {topGenres.slice(0, 3).map(({ genre, score }, index) => (
              <div key={genre?.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{genre?.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${((score - 1) / 9) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{score.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Top Creators</span>
          </div>
          <div className="space-y-2 text-sm">
            {topCreators.directors.slice(0, 2).map(creator => (
              <div key={creator.id} className="flex items-center justify-between">
                <span className="text-gray-300 truncate">{creator.name}</span>
                <span className="text-purple-400 text-xs">{creator.averageRating.toFixed(1)}</span>
              </div>
            ))}
            {topCreators.actors.slice(0, 1).map(creator => (
              <div key={creator.id} className="flex items-center justify-between">
                <span className="text-gray-300 truncate">{creator.name}</span>
                <span className="text-blue-400 text-xs">{creator.averageRating.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-white">Activity</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Recent Trend</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                userInsights.ratingTrend === 'improving' ? 'bg-green-600/20 text-green-400' :
                userInsights.ratingTrend === 'declining' ? 'bg-red-600/20 text-red-400' :
                'bg-gray-600/20 text-gray-400'
              }`}>
                {userInsights.ratingTrend}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">This Month</span>
              <span className="text-green-400 text-xs">
                {profile.ratings.filter(r => Date.now() - r.timestamp < 30 * 24 * 60 * 60 * 1000).length} ratings
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-white">Recommendations</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Fresh Content</span>
              <span className="text-yellow-400 text-xs">{recommendations.length} items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Excluded Rated</span>
              <span className="text-gray-400 text-xs">{ratedContentIds.size} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Finding perfect matches...</span>
        </div>
      )}

      {/* Recommendations Grid */}
      {!loading && recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <span>Recommended For You</span>
            </h3>
            <div className="text-sm text-gray-400">
              {recommendations.length} personalized picks
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((content) => (
              <MovieCard
                key={content.id}
                content={content}
                onRate={(rating) => handleRate(
                  content.id, 
                  'title' in content ? 'movie' : 'tv', 
                  rating, 
                  content.genre_ids
                )}
                onDetailedRate={handleDetailedRate}
                showRating={true}
                showDetailedRating={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <div className="text-center py-12 space-y-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              You've seen all our current recommendations. Check back later for fresh content or explore the Discover tab.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={loadRecommendations}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Refresh Recommendations
            </button>
            <button
              onClick={() => window.location.hash = '#discover'}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Explore Discover
            </button>
          </div>
        </div>
      )}
    </div>
  );
};