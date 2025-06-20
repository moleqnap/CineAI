import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { MovieCard } from './components/MovieCard';
import { MoodSelector } from './components/MoodSelector';
import { UserStats } from './components/UserStats';
import { RecommendationEngine } from './components/RecommendationEngine';
import { AIRecommendationPanel } from './components/AIRecommendationPanel';
import { AdvancedForYouPage } from './components/AdvancedForYouPage';
import { RatedContentManager } from './components/RatedContentManager';
import { FollowingTab } from './components/FollowingTab';
import { TrailerSection } from './components/TrailerSection';
import { DiscoverFilters } from './components/DiscoverFilters';
import { useUserProfile } from './hooks/useUserProfile';
import { useContent } from './hooks/useContent';
import { Mood, ContentItem } from './types';
import { Sparkles, Film, Loader, Search } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [filterLoading, setFilterLoading] = useState(false);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'release_date' | 'title'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [contentType, setContentType] = useState<'all' | 'movie' | 'tv'>('all');

  const { addRating, addDetailedRating, setMood, profile } = useUserProfile();
  const { 
    trendingMovies, 
    trendingTVShows, 
    genres, 
    loading, 
    error, 
    discoverContentWithFilters,
    searchForContent 
  } = useContent();

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    addRating(contentId, contentType, rating, genreIds);
  };

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
  };

  const handleMoodSelect = (mood: Mood) => {
    setMood(mood);
  };

  // Handle filter changes
  const handleFiltersChange = async () => {
    if (activeTab !== 'discover') return;

    setFilterLoading(true);
    try {
      const results = await discoverContentWithFilters({
        contentType,
        genreIds: selectedGenres,
        year: selectedYear,
        sortBy,
        sortOrder,
        page: 1
      });
      setFilteredContent(results);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setFilterLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredContent([]);
      return;
    }

    setFilterLoading(true);
    try {
      const results = await searchForContent(query);
      setFilteredContent(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setFilterLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedGenres([]);
    setSelectedYear('');
    setSortBy('popularity');
    setSortOrder('desc');
    setContentType('all');
    setSearchQuery('');
    setFilteredContent([]);
  };

  // Apply filters when they change
  React.useEffect(() => {
    if (activeTab === 'discover' && !searchQuery) {
      handleFiltersChange();
    }
  }, [selectedGenres, selectedYear, sortBy, sortOrder, contentType, activeTab]);

  // Filter out rated content from discover page
  const ratedContentIds = new Set([
    ...profile.ratings.map(r => r.contentId),
    ...profile.detailedRatings.map(r => r.contentId)
  ]);

  // Determine which content to show
  const getDisplayContent = () => {
    if (searchQuery || selectedGenres.length > 0 || selectedYear || contentType !== 'all') {
      // Show filtered/searched content
      return filteredContent.filter(content => !ratedContentIds.has(content.id));
    } else {
      // Show default trending content
      const unratedMovies = trendingMovies.filter(movie => !ratedContentIds.has(movie.id));
      const unratedTVShows = trendingTVShows.filter(show => !ratedContentIds.has(show.id));
      return [...unratedMovies, ...unratedTVShows];
    }
  };

  const displayContent = getDisplayContent();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <Film className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
            <p className="text-gray-400 max-w-md">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'discover' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-3 rounded-full border border-blue-500/30">
                <Sparkles className="w-6 h-6 text-blue-400" />
                <span className="text-blue-400 font-semibold">Keşfet & Puanla</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Film & Dizi Puanla
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  AI Önerilerini Eğit
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                5 yıldızlı puanlama sistemiyle içerikleri değerlendirin ve Neural Collaborative Filtering 
                motorumuzu eğitin. Ne kadar çok puanlarsanız, AI o kadar akıllı öneriler yapar.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Film ve dizi ara..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Filters */}
            <DiscoverFilters
              genres={genres}
              selectedGenres={selectedGenres}
              selectedYear={selectedYear}
              sortBy={sortBy}
              sortOrder={sortOrder}
              contentType={contentType}
              onGenreChange={setSelectedGenres}
              onYearChange={setSelectedYear}
              onSortChange={(newSortBy, newSortOrder) => {
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder);
              }}
              onContentTypeChange={setContentType}
              onReset={handleResetFilters}
            />

            {/* Loading State */}
            {(loading || filterLoading) && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <Loader className="w-8 h-8 text-blue-400 animate-spin" />
                  <span className="text-gray-400 text-lg">
                    {filterLoading ? 'Filtreler uygulanıyor...' : 'Trend içerikler yükleniyor...'}
                  </span>
                </div>
              </div>
            )}

            {/* Content Grid */}
            {!loading && !filterLoading && displayContent.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <Film className="w-7 h-7 text-blue-400" />
                    <span>
                      {searchQuery ? `"${searchQuery}" için sonuçlar` : 
                       selectedGenres.length > 0 || selectedYear || contentType !== 'all' ? 'Filtrelenmiş Sonuçlar' : 
                       'Şu Anda Trend'}
                    </span>
                  </h2>
                  <div className="text-sm text-gray-400">
                    {displayContent.length} içerik • {profile.ratings.length + profile.detailedRatings.length} puanlanmış
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayContent.map((content) => (
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
                      showDetailedRating={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State - No Results */}
            {!loading && !filterLoading && displayContent.length === 0 && (searchQuery || selectedGenres.length > 0 || selectedYear || contentType !== 'all') && (
              <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {searchQuery 
                      ? `"${searchQuery}" için içerik bulunamadı. Farklı anahtar kelimeler deneyin.`
                      : 'Mevcut filtrelerle eşleşen içerik bulunamadı. Filtre kriterlerinizi değiştirmeyi deneyin.'
                    }
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}

            {/* Empty State - All Content Rated */}
            {!loading && !filterLoading && displayContent.length === 0 && !searchQuery && selectedGenres.length === 0 && !selectedYear && contentType === 'all' && (trendingMovies.length > 0 || trendingTVShows.length > 0) && (
              <div className="text-center py-16 space-y-6">
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Hepsini Puanladınız!</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Tüm trend içerikleri puanladınız. Kişiselleştirilmiş önerilere göz atarak yeni içerikler keşfedin.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    Kişisel Önerileri Gör
                  </button>
                  <button
                    onClick={() => setActiveTab('rated')}
                    className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Puanladıklarımı Gör
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trailers' && (
          <TrailerSection />
        )}

        {activeTab === 'recommendations' && (
          <AdvancedForYouPage />
        )}

        {activeTab === 'ai-recommendations' && (
          <AIRecommendationPanel />
        )}

        {activeTab === 'rated' && (
          <RatedContentManager />
        )}

        {activeTab === 'mood' && (
          <div className="max-w-4xl mx-auto">
            <MoodSelector 
              selectedMood={profile.currentMood}
              onMoodSelect={handleMoodSelect}
            />
          </div>
        )}

        {activeTab === 'following' && (
          <FollowingTab />
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <UserStats />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;