import React from 'react';
import { Filter, Calendar, Tag, SortAsc, SortDesc, RotateCcw } from 'lucide-react';
import { Genre } from '../types';

interface DiscoverFiltersProps {
  genres: Genre[];
  selectedGenres: number[];
  selectedYear: string;
  sortBy: 'popularity' | 'rating' | 'release_date' | 'title';
  sortOrder: 'asc' | 'desc';
  contentType: 'all' | 'movie' | 'tv';
  onGenreChange: (genreIds: number[]) => void;
  onYearChange: (year: string) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onContentTypeChange: (type: 'all' | 'movie' | 'tv') => void;
  onReset: () => void;
}

export const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({
  genres,
  selectedGenres,
  selectedYear,
  sortBy,
  sortOrder,
  contentType,
  onGenreChange,
  onYearChange,
  onSortChange,
  onContentTypeChange,
  onReset
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleGenreToggle = (genreId: number) => {
    if (selectedGenres.includes(genreId)) {
      onGenreChange(selectedGenres.filter(id => id !== genreId));
    } else {
      onGenreChange([...selectedGenres, genreId]);
    }
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new field
      onSortChange(newSortBy, 'desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  const hasActiveFilters = selectedGenres.length > 0 || selectedYear !== '' || contentType !== 'all';

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Filters & Sorting</h3>
            <p className="text-sm text-gray-400">Customize your discovery experience</p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Filters */}
        <div className="space-y-6">
          {/* Content Type Filter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-purple-400" />
              <span>Content Type</span>
            </h4>
            <div className="flex space-x-2">
              {[
                { id: 'all', name: 'All Content' },
                { id: 'movie', name: 'Movies' },
                { id: 'tv', name: 'TV Shows' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => onContentTypeChange(type.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    contentType === type.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Year Filter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-400" />
              <span>Release Year</span>
            </h4>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column - Sorting */}
        <div className="space-y-6">
          {/* Sort Options */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <SortDesc className="w-4 h-4 text-blue-400" />
              <span>Sort By</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'popularity', name: 'Popularity' },
                { id: 'rating', name: 'Rating' },
                { id: 'release_date', name: 'Release Date' },
                { id: 'title', name: 'Title' }
              ].map((sort) => (
                <button
                  key={sort.id}
                  onClick={() => handleSortChange(sort.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === sort.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span>{sort.name}</span>
                  {getSortIcon(sort.id)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Genre Filter */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
          <Tag className="w-4 h-4 text-yellow-400" />
          <span>Genres</span>
          {selectedGenres.length > 0 && (
            <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded-full">
              {selectedGenres.length} selected
            </span>
          )}
        </h4>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreToggle(genre.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedGenres.includes(genre.id)
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Active filters:</span>
            <div className="flex items-center space-x-2 text-blue-400">
              {contentType !== 'all' && <span className="bg-purple-600/20 px-2 py-1 rounded">{contentType}</span>}
              {selectedYear && <span className="bg-green-600/20 px-2 py-1 rounded">{selectedYear}</span>}
              {selectedGenres.length > 0 && (
                <span className="bg-yellow-600/20 px-2 py-1 rounded">
                  {selectedGenres.length} genre{selectedGenres.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};