import React, { useState } from 'react';
import { Star, Calendar, Filter, TrendingUp, Film, Tv, RotateCcw } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';
import { MovieCard } from './MovieCard';

export const RatedContent: React.FC = () => {
  const { profile, addDetailedRating } = useUserProfile();
  const { trendingMovies, trendingTVShows } = useContent();
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title'>('date');

  // Get all content that has been rated
  const allContent = [...trendingMovies, ...trendingTVShows];
  const ratedContentIds = new Set([
    ...profile.ratings.map(r => r.contentId),
    ...profile.detailedRatings.map(r => r.contentId)
  ]);

  const ratedContent = allContent.filter(content => ratedContentIds.has(content.id));

  // Filter by content type
  const filteredContent = ratedContent.filter(content => {
    if (filterType === 'all') return true;
    if (filterType === 'movie') return 'title' in content;
    if (filterType === 'tv') return 'name' in content;
    return true;
  });

  // Sort content
  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        const aRating = profile.ratings.find(r => r.contentId === a.id) || 
                       profile.detailedRatings.find(r => r.contentId === a.id);
        const bRating = profile.ratings.find(r => r.contentId === b.id) || 
                       profile.detailedRatings.find(r => r.contentId === b.id);
        return (bRating?.timestamp || 0) - (aRating?.timestamp || 0);
      
      case 'rating':
        const aUserRating = profile.ratings.find(r => r.contentId === a.id)?.rating || 
                           (profile.detailedRatings.find(r => r.contentId === a.id)?.overall || 0) / 10;
        const bUserRating = profile.ratings.find(r => r.contentId === b.id)?.rating || 
                           (profile.detailedRatings.find(r => r.contentId === b.id)?.overall || 0) / 10;
        return bUserRating - aUserRating;
      
      case 'title':
        const aTitle = 'title' in a ? a.title : a.name;
        const bTitle = 'title' in b ? b.title : b.name;
        return aTitle.localeCompare(bTitle);
      
      default:
        return 0;
    }
  });

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
  };

  if (ratedContent.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Star className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">No Rated Content Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Start rating movies and TV shows to see them here. Your ratings help us provide better recommendations.
            </p>
          </div>
          <button
            onClick={() => window.location.hash = '#discover'}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            Start Rating Content
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Star className="w-8 h-8 text-yellow-400" />
            <span>Your Rated Content</span>
          </h2>
          <p className="text-gray-400 mt-1">
            {ratedContent.length} items rated • {profile.detailedRatings.length} detailed ratings
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center space-x-4">
          {/* Content Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Content</option>
              <option value="movie">Movies Only</option>
              <option value="tv">TV Shows Only</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="date">Recently Rated</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Film className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {ratedContent.filter(c => 'title' in c).length}
              </div>
              <div className="text-sm text-gray-400">Movies Rated</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Tv className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {ratedContent.filter(c => 'name' in c).length}
              </div>
              <div className="text-sm text-gray-400">TV Shows Rated</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {profile.ratings.length > 0 
                  ? (profile.ratings.reduce((sum, r) => sum + r.rating, 0) / profile.ratings.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedContent.map((content) => {
          const existingRating = profile.ratings.find(r => r.contentId === content.id);
          const existingDetailedRating = profile.detailedRatings.find(r => r.contentId === content.id);
          
          return (
            <div key={content.id} className="relative">
              <MovieCard
                content={content}
                onDetailedRate={handleDetailedRate}
                userRating={existingRating?.rating || existingDetailedRating?.overall}
                showRating={false} // Don't show rating controls since already rated
                showDetailedRating={true} // Allow updating detailed ratings
              />
              
              {/* Rating Display */}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">
                    {existingDetailedRating 
                      ? existingDetailedRating.overall 
                      : existingRating 
                        ? (existingRating.rating * 10).toFixed(0)
                        : '0'
                    }
                  </span>
                </div>
                {existingDetailedRating && (
                  <div className="text-xs text-gray-300 mt-1">
                    Detailed Rating
                  </div>
                )}
              </div>

              {/* Rating Date */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <div className="flex items-center space-x-1 text-xs text-gray-300">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(
                      existingDetailedRating?.timestamp || existingRating?.timestamp || 0
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredContent.length === 0 && ratedContent.length > 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">No Content Found</h3>
            <p className="text-gray-400">
              No {filterType === 'movie' ? 'movies' : filterType === 'tv' ? 'TV shows' : 'content'} match your current filter.
            </p>
          </div>
          <button
            onClick={() => setFilterType('all')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};