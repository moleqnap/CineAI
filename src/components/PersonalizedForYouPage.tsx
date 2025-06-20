import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star, 
  Film, 
  Tv, 
  Calendar,
  Award,
  Eye,
  BarChart3,
  RefreshCw,
  Filter,
  Gem,
  History,
  Target,
  Users,
  Lightbulb,
  Settings
} from 'lucide-react';
import { usePersonalizedRecommendations } from '../hooks/usePersonalizedRecommendations';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';
import { MovieCard } from './MovieCard';

export const PersonalizedForYouPage: React.FC = () => {
  const {
    recommendations,
    userStats,
    isAnalyzing,
    lastUpdate,
    filters,
    setFilters,
    analyzeAndRecommend,
    getRecommendationsByCategory,
    getRecommendationsByDecade,
    hasEnoughData
  } = usePersonalizedRecommendations();

  const { addRating, addDetailedRating } = useUserProfile();
  const { genres } = useContent();
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'genre_match' | 'decade_match' | 'quality_match' | 'discovery'>('all');

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    addRating(contentId, contentType, rating, genreIds);
  };

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
  };

  // Yeni kullanıcı deneyimi
  if (!hasEnoughData) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-3 rounded-full border border-purple-500/30">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-semibold">Kişisel Profil Oluşturuluyor</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Size Özel İçerik Keşfi
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Gelişmiş algoritma sistemi, tüm film ve dizi arşivini analiz ederek size özel öneriler sunuyor. 
            En az 3 içerik puanlayın ve kişisel profilinizi oluşturmaya başlayın.
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50 text-center">
          <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-purple-400" />
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-4">Profil Analiz Sistemi</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Tür Analizi</span>
              </h4>
              <p className="text-sm text-gray-400">
                Hangi türleri sevdiğinizi öğrenir ve benzer kaliteli içerikleri bulur
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-green-400" />
                <span>Dönem Tercihleri</span>
              </h4>
              <p className="text-sm text-gray-400">
                Hangi dönemlerin yapımlarını sevdiğinizi analiz eder
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Gem className="w-5 h-5 text-purple-400" />
                <span>Gizli İnciler</span>
              </h4>
              <p className="text-sm text-gray-400">
                Yüksek puanlı ama gözden kaçmış kaliteli yapımları keşfedin
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <span>Kalite Eşleşmesi</span>
              </h4>
              <p className="text-sm text-gray-400">
                Beğeni seviyenize uygun kalitede içerikler önerir
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-600/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Users className="w-5 h-5 text-blue-400" />
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
              {3 - userStats.totalRatings} puanlama daha yapın ve kişisel önerilerinizi görün
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
          <span className="text-purple-400 font-semibold">Size Özel Seçildi</span>
          {isAnalyzing && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Analiz ediliyor...</span>
            </div>
          )}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Kişiselleştirilmiş İçerik Keşfi
        </h2>
        
        <p className="text-gray-400 max-w-3xl mx-auto">
          {userStats.totalRatings} puanlamanız analiz edilerek, tür tercihlerinize ve kalite beklentinize uygun 
          içerikler özenle seçildi. Trend içeriklerle sınırlı kalmadan, geçmişin en iyi yapımlarını keşfedin.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={analyzeAndRecommend}
            disabled={isAnalyzing}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Analizi Yenile</span>
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

      {/* Kullanıcı İstatistikleri */}
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
              <Film className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{userStats.contentTypePreference.movies.toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Film Tercihi</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{recommendations.length}</div>
              <div className="text-sm text-gray-400">Kişisel Öneri</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tür Tercihleri */}
      {Object.keys(userStats.genreDistribution).length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span>Tür Tercihleriniz</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(userStats.genreDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 8)
              .map(([genre, percentage]) => (
                <div key={genre} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{genre}</span>
                    <span className="text-xs text-gray-400">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filtreler */}
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
                minRating: 0,
                maxRating: 10,
                sortBy: 'score',
                sortOrder: 'desc'
              })}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sıfırla
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* İçerik Tipi */}
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

            {/* Sıralama */}
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
                <option value="score_desc">Eşleşme Puanı (Yüksek)</option>
                <option value="rating_desc">IMDB Puanı (Yüksek)</option>
                <option value="release_date_desc">Çıkış Tarihi (Yeni)</option>
                <option value="match_percentage_desc">Uyumluluk (Yüksek)</option>
              </select>
            </div>

            {/* Minimum Puan */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Minimum IMDB Puanı: {filters.minRating}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Kategori Filtreleri */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-lg font-semibold text-white mb-4">Öneri Kategorileri</h3>
        
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', name: 'Tümü', icon: Star, count: recommendations.length },
            { id: 'genre_match', name: 'Tür Eşleşmesi', icon: Target, count: getRecommendationsByCategory('genre_match').length },
            { id: 'quality_match', name: 'Kalite Eşleşmesi', icon: Award, count: getRecommendationsByCategory('quality_match').length },
            { id: 'discovery', name: 'Keşif', icon: Gem, count: getRecommendationsByCategory('discovery').length },
            { id: 'decade_match', name: 'Dönem Eşleşmesi', icon: History, count: getRecommendationsByCategory('decade_match').length }
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

      {/* Öneriler */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span>
                {activeCategory === 'all' ? 'Tüm Öneriler' :
                 activeCategory === 'genre_match' ? 'Tür Eşleşmeleri' :
                 activeCategory === 'quality_match' ? 'Kalite Eşleşmeleri' :
                 activeCategory === 'discovery' ? 'Keşif Önerileri' :
                 'Dönem Eşleşmeleri'}
              </span>
            </h3>
            <div className="text-sm text-gray-400">
              {activeCategory === 'all' 
                ? recommendations.length 
                : getRecommendationsByCategory(activeCategory).length
              } öneri
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(activeCategory === 'all' 
              ? recommendations 
              : getRecommendationsByCategory(activeCategory)
            ).map((recommendation) => {
              const content = recommendation.content;
              
              return (
                <div key={content.id} className="relative">
                  <MovieCard
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
                  
                  {/* Eşleşme Puanı */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    %{recommendation.matchPercentage.toFixed(0)} eşleşme
                  </div>
                  
                  {/* Kategori Badge */}
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="flex items-center space-x-1">
                      {recommendation.category === 'genre_match' && <Target className="w-3 h-3 text-blue-400" />}
                      {recommendation.category === 'quality_match' && <Award className="w-3 h-3 text-yellow-400" />}
                      {recommendation.category === 'discovery' && <Gem className="w-3 h-3 text-purple-400" />}
                      {recommendation.category === 'decade_match' && <History className="w-3 h-3 text-green-400" />}
                      <span className="text-xs text-white font-medium">
                        {(recommendation.confidence * 100).toFixed(0)}% güven
                      </span>
                    </div>
                  </div>
                  
                  {/* Öneri Nedenleri */}
                  {recommendation.reasons.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Eye className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-purple-400 mb-1">Neden öneriliyor:</div>
                          <div className="space-y-1">
                            {recommendation.reasons.map((reason, idx) => (
                              <div key={idx} className="text-xs text-gray-300">
                                • {reason}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dönem */}
                  <div className="absolute bottom-4 right-4 bg-gray-800/80 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-xs text-gray-300">{recommendation.releaseDecade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {!isAnalyzing && recommendations.length === 0 && (
        <div className="text-center py-12 space-y-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Öneriler Hazırlanıyor</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Profiliniz analiz ediliyor. Daha fazla içerik puanlayarak öneri kalitesini artırabilirsiniz.
            </p>
          </div>
          <button
            onClick={analyzeAndRecommend}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            Analizi Başlat
          </button>
        </div>
      )}

      {/* Son Güncelleme Bilgisi */}
      {lastUpdate > 0 && (
        <div className="bg-gray-900/30 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-400">
            Son analiz: {new Date(lastUpdate).toLocaleString('tr-TR')} • 
            {userStats.totalRatings} puanlama analiz edildi • 
            Ortalama beğeni: {userStats.averageRating.toFixed(1)}/10
          </p>
        </div>
      )}
    </div>
  );
};