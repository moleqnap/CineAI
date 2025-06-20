import React, { useState } from 'react';
import { Star, Calendar, Filter, TrendingUp, Film, Tv, RotateCcw, Eye, Trash2, Edit, Search, SortAsc, SortDesc } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';
import { MovieCard } from './MovieCard';

export const RatedContentManager: React.FC = () => {
  const { profile, addDetailedRating } = useUserProfile();
  const { trendingMovies, trendingTVShows } = useContent();
  
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title' | 'match_score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showOnlyDetailed, setShowOnlyDetailed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Tüm puanlanmış içerikleri al
  const allContent = [...trendingMovies, ...trendingTVShows];
  const ratedContentIds = new Set([
    ...profile.ratings.map(r => r.contentId),
    ...profile.detailedRatings.map(r => r.contentId)
  ]);

  const ratedContent = allContent.filter(content => ratedContentIds.has(content.id));

  // Arama filtresi uygula
  const searchFilteredContent = searchQuery
    ? ratedContent.filter(content => {
        const title = 'title' in content ? content.title : content.name;
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : ratedContent;

  // İçerik tipine göre filtrele
  const typeFilteredContent = searchFilteredContent.filter(content => {
    if (filterType === 'all') return true;
    if (filterType === 'movie') return 'title' in content;
    if (filterType === 'tv') return 'name' in content;
    return true;
  });

  // Sadece detaylı puanlamaları göster filtresi
  const finalFilteredContent = showOnlyDetailed 
    ? typeFilteredContent.filter(content => 
        profile.detailedRatings.some(r => r.contentId === content.id)
      )
    : typeFilteredContent;

  // İçerikleri sırala
  const sortedContent = [...finalFilteredContent].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'date':
        const aRating = profile.ratings.find(r => r.contentId === a.id) || 
                       profile.detailedRatings.find(r => r.contentId === a.id);
        const bRating = profile.ratings.find(r => r.contentId === b.id) || 
                       profile.detailedRatings.find(r => r.contentId === b.id);
        aValue = aRating?.timestamp || 0;
        bValue = bRating?.timestamp || 0;
        break;
      
      case 'rating':
        const aUserRating = profile.ratings.find(r => r.contentId === a.id)?.rating || 
                           (profile.detailedRatings.find(r => r.contentId === a.id)?.overall || 0) / 10;
        const bUserRating = profile.ratings.find(r => r.contentId === b.id)?.rating || 
                           (profile.detailedRatings.find(r => r.contentId === b.id)?.overall || 0) / 10;
        aValue = aUserRating;
        bValue = bUserRating;
        break;
      
      case 'title':
        aValue = ('title' in a ? a.title : a.name).toLowerCase();
        bValue = ('title' in b ? b.title : b.name).toLowerCase();
        break;
      
      case 'match_score':
        // IMDB puanı ile kullanıcı puanı arasındaki uyum
        const aImdb = a.vote_average;
        const aUser = profile.ratings.find(r => r.contentId === a.id)?.rating || 
                     (profile.detailedRatings.find(r => r.contentId === a.id)?.overall || 0) / 10;
        const bImdb = b.vote_average;
        const bUser = profile.ratings.find(r => r.contentId === b.id)?.rating || 
                     (profile.detailedRatings.find(r => r.contentId === b.id)?.overall || 0) / 10;
        
        aValue = 10 - Math.abs(aImdb - aUser);
        bValue = 10 - Math.abs(bImdb - bUser);
        break;
      
      default:
        return 0;
    }

    if (sortBy === 'title') {
      return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }
    
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  // Sayfalama
  const totalPages = Math.ceil(sortedContent.length / itemsPerPage);
  const paginatedContent = sortedContent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
  };

  const handleSortToggle = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilterType('all');
    setSortBy('date');
    setSortOrder('desc');
    setShowOnlyDetailed(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // İstatistikler
  const stats = {
    total: ratedContent.length,
    movies: ratedContent.filter(c => 'title' in c).length,
    tvShows: ratedContent.filter(c => 'name' in c).length,
    detailed: profile.detailedRatings.length,
    averageRating: profile.ratings.length > 0 
      ? profile.ratings.reduce((sum, r) => sum + r.rating, 0) / profile.ratings.length 
      : 0,
    averageDetailedRating: profile.detailedRatings.length > 0
      ? profile.detailedRatings.reduce((sum, r) => sum + r.overall, 0) / profile.detailedRatings.length / 10
      : 0
  };

  if (ratedContent.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Star className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Henüz Puanlama Yapmadınız</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Film ve dizileri puanlamaya başlayın. Puanlamalarınız burada görünecek ve 
              kişiselleştirilmiş öneriler almanıza yardımcı olacak.
            </p>
          </div>
          <button
            onClick={() => window.location.hash = '#discover'}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            İçerik Puanlamaya Başla
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
            <span>Değerlendirdiklerim</span>
          </h2>
          <p className="text-gray-400 mt-1">
            {stats.total} içerik puanladınız • {stats.detailed} detaylı değerlendirme
          </p>
        </div>

        {/* Hızlı İstatistikler */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-gray-800/50 px-3 py-2 rounded-lg">
            <span className="text-gray-400">Ortalama: </span>
            <span className="text-white font-semibold">{stats.averageRating.toFixed(1)}</span>
          </div>
          {stats.detailed > 0 && (
            <div className="bg-purple-600/20 px-3 py-2 rounded-lg border border-purple-500/30">
              <span className="text-purple-400">Detaylı Ort: </span>
              <span className="text-white font-semibold">{stats.averageDetailedRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stats.movies}</div>
              <div className="text-xs text-gray-400">Film</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Tv className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stats.tvShows}</div>
              <div className="text-xs text-gray-400">Dizi</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
              <div className="text-xs text-gray-400">Ortalama</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{stats.detailed}</div>
              <div className="text-xs text-gray-400">Detaylı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 space-y-6">
        {/* Arama Çubuğu */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="İçerik ara..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* İçerik Tipi Filtresi */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tüm İçerikler</option>
                <option value="movie">Sadece Filmler</option>
                <option value="tv">Sadece Diziler</option>
              </select>
            </div>

            {/* Sıralama Butonları */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              <div className="flex space-x-1">
                {[
                  { id: 'date', name: 'Tarih' },
                  { id: 'rating', name: 'Puanım' },
                  { id: 'title', name: 'Alfabetik' },
                  { id: 'match_score', name: 'IMDB Uyumu' }
                ].map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => handleSortToggle(sort.id as any)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortBy === sort.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span>{sort.name}</span>
                    {sortBy === sort.id && (
                      sortOrder === 'desc' ? <SortDesc className="w-3 h-3" /> : <SortAsc className="w-3 h-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Detaylı Puanlama Filtresi */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyDetailed}
                onChange={(e) => {
                  setShowOnlyDetailed(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Sadece Detaylı Puanlamalar</span>
            </label>
          </div>

          {/* Sıfırlama */}
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sıfırla</span>
          </button>
        </div>

        {/* Aktif Filtreler Özeti */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-400">
            <span>Gösterilen: {sortedContent.length} / {stats.total}</span>
            {filterType !== 'all' && (
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                {filterType === 'movie' ? 'Filmler' : 'Diziler'}
              </span>
            )}
            {showOnlyDetailed && (
              <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                Detaylı Puanlamalar
              </span>
            )}
            {searchQuery && (
              <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded">
                "{searchQuery}"
              </span>
            )}
          </div>
          
          <div className="text-gray-400">
            Sayfa {currentPage} / {totalPages}
          </div>
        </div>
      </div>

      {/* İçerik Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedContent.map((content) => {
          const existingRating = profile.ratings.find(r => r.contentId === content.id);
          const existingDetailedRating = profile.detailedRatings.find(r => r.contentId === content.id);
          
          // IMDB uyumu hesapla
          const userRating = existingDetailedRating 
            ? existingDetailedRating.overall / 10 
            : existingRating?.rating || 0;
          const imdbRating = content.vote_average;
          const matchScore = userRating > 0 ? 10 - Math.abs(imdbRating - userRating) : 0;
          
          return (
            <div key={content.id} className="relative">
              <MovieCard
                content={content}
                onDetailedRate={handleDetailedRate}
                userRating={existingRating?.rating || existingDetailedRating?.overall}
                showRating={false} // Puanlama kontrollerini gizle
                showDetailedRating={true} // Detaylı puanlama güncellemeye izin ver
              />
              
              {/* Puanlama Göstergesi */}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">
                    {existingDetailedRating 
                      ? (existingDetailedRating.overall / 10).toFixed(1)
                      : existingRating 
                        ? existingRating.rating.toFixed(1)
                        : '0.0'
                    }
                  </span>
                </div>
                {existingDetailedRating && (
                  <div className="text-xs text-purple-400 mt-1 text-center">
                    Detaylı
                  </div>
                )}
              </div>

              {/* IMDB Uyumu */}
              {matchScore > 0 && (
                <div className="absolute top-16 right-4 bg-green-600/80 backdrop-blur-sm rounded px-2 py-1">
                  <div className="text-xs text-white font-medium">
                    {matchScore >= 8 ? '🎯' : matchScore >= 6 ? '✅' : '⚠️'} {matchScore.toFixed(1)}
                  </div>
                </div>
              )}

              {/* Puanlama Tarihi */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <div className="flex items-center space-x-1 text-xs text-gray-300">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(
                      existingDetailedRating?.timestamp || existingRating?.timestamp || 0
                    ).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Detaylı Puanlama İndikatörü */}
              {existingDetailedRating && (
                <div className="absolute bottom-4 right-4 bg-purple-600/80 backdrop-blur-sm rounded px-2 py-1">
                  <div className="text-xs text-white font-medium">
                    O:{existingDetailedRating.overall} 
                    A:{existingDetailedRating.acting} 
                    S:{existingDetailedRating.screenplay} 
                    D:{existingDetailedRating.direction}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Önceki
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i));
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}

      {/* Filtrelenmiş Sonuçlar için Boş Durum */}
      {sortedContent.length === 0 && ratedContent.length > 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Filter className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Filtre Sonucu Bulunamadı</h3>
            <p className="text-gray-400">
              Seçili filtrelerle eşleşen içerik bulunamadı. Filtreleri değiştirmeyi deneyin.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Filtreleri Temizle</span>
          </button>
        </div>
      )}
    </div>
  );
};