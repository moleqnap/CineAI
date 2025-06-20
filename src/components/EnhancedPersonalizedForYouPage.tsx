import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Star, 
  Film, 
  Tv, 
  Calendar,
  Award,
  Eye,
  BarChart3,
  RefreshCw,
  Filter,
  Target,
  Users,
  Lightbulb,
  Settings,
  Zap,
  Brain,
  Youtube
} from 'lucide-react';
import { useEnhancedPersonalizedRecommendations } from '../hooks/useEnhancedPersonalizedRecommendations';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';
import { EnhancedMovieCard } from './EnhancedMovieCard';

export const EnhancedPersonalizedForYouPage: React.FC = () => {
  const {
    recommendations,
    userPreferences,
    isAnalyzing,
    lastUpdate,
    filters,
    setFilters,
    analyzeAndRecommend,
    getRecommendationsByCategory,
    hasEnoughData
  } = useEnhancedPersonalizedRecommendations();

  const { addRating, addDetailedRating, profile } = useUserProfile();
  const { genres } = useContent();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'genre_match' | 'decade_match' | 'quality_match' | 'discovery'>('all');

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    addRating(contentId, contentType, rating, genreIds);
  };

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
  };

  // Calculate user stats
  const userStats = {
    totalRatings: profile.ratings.length + profile.detailedRatings.length,
    averageRating: userPreferences.averageRating / 10,
    contentTypePreference: userPreferences.contentTypePreference,
    topGenres: userPreferences.preferredGenres.slice(0, 5)
  };

  // New user experience
  if (!hasEnoughData) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-3 rounded-full border border-purple-500/30">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-semibold">AI Öğreniyor</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Kişisel AI Küratörünüz Hazırlanıyor
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Gelişmiş eşleştirme algoritması, TMDb'nin geniş arşivini analiz ederek size özel içerikler buluyor. 
            En az 3 içerik puanlayın ve %60+ eşleşme skorlu öneriler almaya başlayın.
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50 text-center">
          <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-purple-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-4">Eşleştirme Algoritması</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold text-white flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">40%</span>
                  </div>
                  <span>Tür Uyumu</span>
                </h4>
                <p className="text-sm text-gray-400">
                  Hangi türleri sevdiğinizi öğrenir ve benzer kaliteli içerikleri bulur
                </p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold text-white flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">30%</span>
                  </div>
                  <span>Kalite Eşleşmesi</span>
                </h4>
                <p className="text-sm text-gray-400">
                  Beğeni seviyenize uygun kalitede içerikler önerir
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold text-white flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-sm">20%</span>
                  </div>
                  <span>Dönem Tercihi</span>
                </h4>
                <p className="text-sm text-gray-400">
                  Hangi dönemlerin yapımlarını sevdiğinizi analiz eder
                </p>
              </div>
              
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold text-white flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-sm">10%</span>
                  </div>
                  <span>Çeşitlilik</span>
                </h4>
                <p className="text-sm text-gray-400">
                  Yeni türler keşfetmeniz için çeşitlilik faktörü
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-600/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">Mevcut Durum</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {userStats.totalRatings}/3 Puanlama
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((userStats.totalRatings / 3) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-3">
              {3 - userStats.totalRatings} puanlama daha yapın ve %60+ eşleşme skorlu öneriler görün
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-3 rounded-full border border-purple-500/30">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span className="text-purple-400 font-semibold">AI Küratörlü İçerikler</span>
          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Analiz ediliyor...</span>
            </div>
          )}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Size Özel Eşleştirilmiş İçerikler
        </h2>
        
        <p className="text-gray-400 max-w-3xl mx-auto">
          {userStats.totalRatings} puanlamanız TMDb API üzerinden analiz edilerek, %60+ eşleşme skorlu 
          içerikler dinamik olarak keşfedildi. Her öneri fragmanı ile birlikte sunuluyor.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={analyzeAndRecommend}
            disabled={isAnalyzing}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Yeniden Analiz Et</span>
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Filtreler</span>
          </button>
        </div>
      </div>

      {/* User Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userStats.totalRatings}</div>
              <div className="text-sm text-gray-400">Toplam Puanlama</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userStats.averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-400">Ortalama Puan</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{recommendations.length}</div>
              <div className="text-sm text-gray-400">Eşleşen İçerik</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Youtube className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {recommendations.filter(r => r.trailerKey).length}
              </div>
              <div className="text-sm text-gray-400">Fragmanlı</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Genres */}
      {userStats.topGenres.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span>Tür Tercihleriniz</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {userStats.topGenres.map((genreData) => {
              const genre = genres.find(g => g.id === genreData.genreId);
              if (!genre) return null;
              
              return (
                <div key={genre.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{genre.name}</span>
                    <span className="text-xs text-gray-400">{genreData.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${((genreData.score - 5) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-400" />
              <span>Gelişmiş Filtreler</span>
            </h3>
            <button
              onClick={() => setFilters({
                contentType: 'all',
                genres: [],
                decades: [],
                minMatchScore: 60,
                sortBy: 'match_score',
                sortOrder: 'desc'
              })}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sıfırla
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">İçerik Tipi</label>
              <select
                value={filters.contentType}
                onChange={(e) => setFilters(prev => ({ ...prev, contentType: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="movie">Filmler</option>
                <option value="tv">Diziler</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Sıralama</label>
              <select
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('_');
                  setFilters(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="match_score_desc">Eşleşme Skoru (Yüksek)</option>
                <option value="rating_desc">IMDB Puanı (Yüksek)</option>
                <option value="release_date_desc">Çıkış Tarihi (Yeni)</option>
              </select>
            </div>

            {/* Min Match Score */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Min. Eşleşme Skoru: %{filters.minMatchScore}
              </label>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={filters.minMatchScore}
                onChange={(e) => setFilters(prev => ({ ...prev, minMatchScore: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Stats */}
            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-400">
                Gösterilen: {recommendations.length} içerik
              </div>
              <div className="text-xs text-gray-500">
                Ortalama eşleşme: %{recommendations.length > 0 ? Math.round(recommendations.reduce((sum, r) => sum + r.matchScore, 0) / recommendations.length) : 0}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-lg font-semibold text-white mb-4">Öneri Kategorileri</h3>
        
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', name: 'Tümü', icon: Star, count: recommendations.length },
            { id: 'genre_match', name: 'Tür Eşleşmesi', icon: Target, count: getRecommendationsByCategory('genre_match').length },
            { id: 'quality_match', name: 'Kalite Eşleşmesi', icon: Award, count: getRecommendationsByCategory('quality_match').length },
            { id: 'decade_match', name: 'Dönem Eşleşmesi', icon: Calendar, count: getRecommendationsByCategory('decade_match').length },
            { id: 'discovery', name: 'Keşif', icon: Eye, count: getRecommendationsByCategory('discovery').length }
          ].map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{category.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span>
                {activeCategory === 'all' ? 'Tüm Öneriler' :
                 activeCategory === 'genre_match' ? 'Tür Eşleşmeleri' :
                 activeCategory === 'quality_match' ? 'Kalite Eşleşmeleri' :
                 activeCategory === 'decade_match' ? 'Dönem Eşleşmeleri' :
                 'Keşif Önerileri'}
              </span>
            </h3>
            <div className="text-sm text-gray-400">
              {activeCategory === 'all' 
                ? recommendations.length 
                : getRecommendationsByCategory(activeCategory).length
              } öneri • Fragman oranı: %{Math.round((recommendations.filter(r => r.trailerKey).length / recommendations.length) * 100)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(activeCategory === 'all' 
              ? recommendations 
              : getRecommendationsByCategory(activeCategory)
            ).map((recommendation) => (
              <EnhancedMovieCard
                key={recommendation.content.id}
                content={recommendation.content}
                onRate={(rating) => handleRate(
                  recommendation.content.id, 
                  'title' in recommendation.content ? 'movie' : 'tv', 
                  rating, 
                  recommendation.content.genre_ids || []
                )}
                onDetailedRate={handleDetailedRate}
                showRating={true}
                showDetailedRating={true}
                matchScore={recommendation.matchScore}
                explanation={recommendation.explanation}
                trailerKey={recommendation.trailerKey}
                reasons={recommendation.reasons}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && recommendations.length === 0 && (
        <div className="text-center py-12 space-y-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Target className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">%60+ Eşleşme Bulunamadı</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Mevcut filtrelerle %60+ eşleşme skorlu içerik bulunamadı. Minimum eşleşme skorunu düşürün veya daha fazla içerik puanlayın.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setFilters(prev => ({ ...prev, minMatchScore: 50 }))}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            >
              Minimum Skoru %50'ye Düşür
            </button>
            <button
              onClick={analyzeAndRecommend}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Yeniden Analiz Et
            </button>
          </div>
        </div>
      )}

      {/* Last Update Info */}
      {lastUpdate > 0 && (
        <div className="bg-gray-900/30 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-400">
            Son analiz: {new Date(lastUpdate).toLocaleString('tr-TR')} • 
            {userStats.totalRatings} puanlama analiz edildi • 
            TMDb API üzerinden {recommendations.length} eşleşen içerik bulundu
          </p>
        </div>
      )}
    </div>
  );
};