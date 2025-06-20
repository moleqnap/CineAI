import React from 'react';
import { Star, TrendingUp, Heart, RotateCcw, BarChart3, Calendar, Film, Tv } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';

export const UserStats: React.FC = () => {
  const { profile, getTopGenres, getRatingCount, getAverageRating, resetProfile } = useUserProfile();
  const { genres } = useContent();
  
  const topGenres = getTopGenres(5).map(({ genreId, score }) => ({
    genre: genres.find(g => g.id === genreId),
    score
  })).filter(item => item.genre);
  
  const ratingCount = getRatingCount();
  const averageRating = getAverageRating();

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = Array(10).fill(0);
    const detailedDistribution = Array(10).fill(0);
    
    // Count simple ratings (1-10 scale)
    profile.ratings.forEach(rating => {
      const bucket = Math.min(Math.floor(rating.rating), 9);
      distribution[bucket]++;
    });

    // Count detailed ratings (0-100 scale converted to 1-10)
    profile.detailedRatings.forEach(rating => {
      const bucket = Math.min(Math.floor(rating.overall / 10), 9);
      detailedDistribution[bucket]++;
    });

    return { distribution, detailedDistribution };
  };

  const getRecentRatingTrend = () => {
    const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentRatings = [...profile.ratings, ...profile.detailedRatings.map(dr => ({
      ...dr,
      rating: dr.overall / 10
    }))].filter(r => r.timestamp > last30Days);

    // Group by week
    const weeks = Array(4).fill(0).map(() => ({ count: 0, average: 0, total: 0 }));
    
    recentRatings.forEach(rating => {
      const weekIndex = Math.floor((Date.now() - rating.timestamp) / (7 * 24 * 60 * 60 * 1000));
      if (weekIndex < 4) {
        weeks[3 - weekIndex].count++;
        weeks[3 - weekIndex].total += rating.rating;
      }
    });

    weeks.forEach(week => {
      if (week.count > 0) {
        week.average = week.total / week.count;
      }
    });

    return weeks;
  };

  const getContentTypeBreakdown = () => {
    const movieRatings = profile.ratings.filter(r => r.contentType === 'movie').length;
    const tvRatings = profile.ratings.filter(r => r.contentType === 'tv').length;
    const movieDetailed = profile.detailedRatings.filter(r => r.contentType === 'movie').length;
    const tvDetailed = profile.detailedRatings.filter(r => r.contentType === 'tv').length;

    return {
      movies: movieRatings + movieDetailed,
      tv: tvRatings + tvDetailed,
      total: movieRatings + tvRatings + movieDetailed + tvDetailed
    };
  };

  const handleResetProfile = () => {
    if (window.confirm('Are you sure you want to reset your profile? This will delete all your ratings and preferences.')) {
      resetProfile();
    }
  };

  if (ratingCount === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Star className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Rating Content</h3>
            <p className="text-gray-400 text-sm">Rate movies and TV shows to see your personalized stats and get better recommendations</p>
          </div>
        </div>
      </div>
    );
  }

  const { distribution, detailedDistribution } = getRatingDistribution();
  const recentTrend = getRecentRatingTrend();
  const contentBreakdown = getContentTypeBreakdown();
  const maxCount = Math.max(...distribution, ...detailedDistribution);

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>Your Taste Profile</span>
          </h3>
          <button
            onClick={handleResetProfile}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{ratingCount}</div>
            <div className="text-sm text-gray-400">Total Ratings</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-400">Avg Rating</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{profile.detailedRatings.length}</div>
            <div className="text-sm text-gray-400">Detailed</div>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{topGenres.length}</div>
            <div className="text-sm text-gray-400">Top Genres</div>
          </div>
        </div>

        {/* Top Genres */}
        {topGenres.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span>Favorite Genres</span>
            </h4>
            <div className="space-y-3">
              {topGenres.map(({ genre, score }, index) => (
                <div key={genre?.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <span className="text-gray-300 font-medium">{genre?.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${((score - 1) / 9) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8 text-right">{score.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Rating Distribution</span>
        </h4>
        
        <div className="space-y-6">
          {/* Distribution Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Rating Scale (1-10)</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-400 text-xs">Quick Ratings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-gray-400 text-xs">Detailed Ratings</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-10 gap-2 h-32">
              {distribution.map((count, index) => {
                const detailedCount = detailedDistribution[index];
                const totalCount = count + detailedCount;
                const height = maxCount > 0 ? (totalCount / maxCount) * 100 : 0;
                const quickHeight = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="flex-1 flex flex-col justify-end w-full relative">
                      {/* Detailed ratings (purple) */}
                      {detailedCount > 0 && (
                        <div 
                          className="w-full bg-purple-500 rounded-t transition-all duration-700"
                          style={{ height: `${height - quickHeight}%` }}
                        />
                      )}
                      {/* Quick ratings (blue) */}
                      {count > 0 && (
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-700"
                          style={{ height: `${quickHeight}%` }}
                        />
                      )}
                      {totalCount > 0 && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-medium">
                          {totalCount}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content Type Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Film className="w-4 h-4 text-blue-400" />
                <span>Content Types</span>
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Film className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">Movies</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: contentBreakdown.total > 0 ? `${(contentBreakdown.movies / contentBreakdown.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{contentBreakdown.movies}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tv className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300 text-sm">TV Shows</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: contentBreakdown.total > 0 ? `${(contentBreakdown.tv / contentBreakdown.total) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{contentBreakdown.tv}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Trend */}
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-400" />
                <span>Recent Activity (4 weeks)</span>
              </h5>
              <div className="grid grid-cols-4 gap-2">
                {recentTrend.map((week, index) => (
                  <div key={index} className="text-center">
                    <div className="h-12 flex items-end justify-center">
                      <div 
                        className="w-4 bg-green-500 rounded-t transition-all duration-700"
                        style={{ height: `${week.count > 0 ? Math.max((week.count / Math.max(...recentTrend.map(w => w.count))) * 100, 10) : 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{week.count}</div>
                    <div className="text-xs text-gray-500">W{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rating Quality Insights */}
          <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
            <h5 className="text-sm font-semibold text-white">Rating Insights</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {profile.ratings.filter(r => r.rating >= 8).length + profile.detailedRatings.filter(r => r.overall >= 80).length}
                </div>
                <div className="text-gray-400">High Ratings (8+)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {profile.ratings.filter(r => r.rating >= 6 && r.rating < 8).length + profile.detailedRatings.filter(r => r.overall >= 60 && r.overall < 80).length}
                </div>
                <div className="text-gray-400">Good Ratings (6-7)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">
                  {profile.ratings.filter(r => r.rating < 6).length + profile.detailedRatings.filter(r => r.overall < 60).length}
                </div>
                <div className="text-gray-400">Low Ratings (&lt;6)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};