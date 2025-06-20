import React, { useState } from 'react';
import { 
  Brain, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Award, 
  Eye, 
  BarChart3, 
  RefreshCw,
  Settings,
  Lightbulb,
  Zap,
  Star,
  Users,
  Calendar,
  Film,
  Tv,
  Youtube,
  ChevronRight,
  Info
} from 'lucide-react';
import { useIntelligentRecommendations } from '../hooks/useIntelligentRecommendations';
import { useAdvancedUserProfiling } from '../hooks/useAdvancedUserProfiling';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';
import { EnhancedMovieCard } from './EnhancedMovieCard';

export const AdvancedForYouPage: React.FC = () => {
  const {
    recommendations,
    insights,
    isGenerating,
    generateRecommendations,
    getRecommendationsByCategory,
    hasEnoughData
  } = useIntelligentRecommendations();

  const { advancedProfile, isAnalyzing, profileMetrics } = useAdvancedUserProfiling();
  const { addRating, addDetailedRating, profile } = useUserProfile();
  const { genres } = useContent();
  
  const [activeCategory, setActiveCategory] = useState<'all' | 'perfect_match' | 'quality_pick' | 'discovery' | 'hidden_gem' | 'creator_pick'>('all');
  const [showProfileInsights, setShowProfileInsights] = useState(false);

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    addRating(contentId, contentType, rating, genreIds);
  };

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
  };

  // Yeterli veri yoksa
  if (!hasEnoughData) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-3 rounded-full border border-purple-500/30">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-semibold">Gelişmiş AI Analizi</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Kişisel Profil Oluşturuluyor
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            Gelişmiş eşleştirme algoritması için daha fazla veri gerekiyor. 
            En az {Math.ceil((20 - profileMetrics.completeness) / 5)} içerik daha puanlayın.
          </p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 border border-gray-800/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Profil Tamamlanma</h3>
            <span className="text-2xl font-bold text-purple-400">
              %{Math.round(profileMetrics.completeness)}
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden mb-6">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
              style={{ width: `${profileMetrics.completeness}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Gelişmiş Analiz Özellikleri</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Çok boyutlu tür analizi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Kalite profili çıkarma</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Dönem tercihi analizi</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-300">Yaratıcı yakınlık haritası</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Akıllı Eşleştirme</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Brain className="w-4 h-4 text-pink-400" />
                  <span className="text-gray-300">6 faktörlü eşleştirme</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-300">Dinamik öncelik sıralaması</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-4 h-4 text-red-400" />
                  <span className="text-gray-300">Güven skoru hesaplama</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  <span className="text-gray-300">Akıllı açıklama sistemi</span>
                </div>
              </div>
            </div>
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
          <Brain className="w-6 h-6 text-purple-400" />
          <span className="text-purple-400 font-semibold">Gelişmiş AI Küratörlüğü</span>
          {isGenerating && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Analiz ediliyor...</span>
            </div>
          )}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Size Özel Akıllı Öneriler
        </h2>
        
        <p className="text-gray-400 max-w-3xl mx-auto">
          6 faktörlü gelişmiş eşleştirme algoritması ile kişiselleştirilmiş içerik keşfi. 
          Her öneri detaylı analiz ve güven skoru ile sunuluyor.
        </p>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={generateRecommendations}
            disabled={isGenerating}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Yeniden Analiz Et</span>
          </button>
          
          <button
            onClick={() => setShowProfileInsights(!showProfileInsights)}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>Profil İçgörüleri</span>
          </button>
        </div>
      </div>

      {/* Profil İçgörüleri */}
      {showProfileInsights && advancedProfile && (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 space-y-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Gelişmiş Profil Analizi</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kalite Profili */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>Kalite Profili</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ortalama Beklenti:</span>
                  <span className="text-white">{(advancedProfile.qualityProfile.averageRating / 10).toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Puanlama Stili:</span>
                  <span className="text-white capitalize">{advancedProfile.qualityProfile.ratingPattern}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tolerans:</span>
                  <span className="text-white">{(advancedProfile.qualityProfile.qualityTolerance / 10).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Davranışsal Profil */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span>Davranış Analizi</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Keşif Eğilimi:</span>
                  <span className="text-white">%{Math.round(advancedProfile.behavioralProfile.explorationTendency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tutarlılık:</span>
                  <span className="text-white">%{Math.round(advancedProfile.behavioralProfile.consistencyScore)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Detaylı Oran:</span>
                  <span className="text-white">%{Math.round(advancedProfile.behavioralProfile.detailedRatingRatio)}</span>
                </div>
              </div>
            </div>

            {/* Profil Metrikleri */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span>Profil Kalitesi</span>
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tamamlanma:</span>
                  <span className="text-white">%{Math.round(advancedProfile.profileMetrics.completeness)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Güvenilirlik:</span>
                  <span className="text-white">%{Math.round(advancedProfile.profileMetrics.reliability)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Veri Noktası:</span>
                  <span className="text-white">{advancedProfile.profileMetrics.dataPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İstatistik Kartları */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{insights.averageMatchScore}</div>
                <div className="text-sm text-gray-400">Ortalama Eşleşme</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{insights.confidenceLevel}%</div>
                <div className="text-sm text-gray-400">Güven Seviyesi</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{insights.diversityScore}%</div>
                <div className="text-sm text-gray-400">Çeşitlilik</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{insights.qualityAssurance}%</div>
                <div className="text-sm text-gray-400">Kalite Güvencesi</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kategori Filtreleri */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <h3 className="text-lg font-semibold text-white mb-4">Akıllı Kategoriler</h3>
        
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', name: 'Tümü', icon: Star, count: recommendations.length },
            { id: 'perfect_match', name: 'Mükemmel Eşleşme', icon: Target, count: getRecommendationsByCategory('perfect_match').length },
            { id: 'quality_pick', name: 'Kalite Seçimi', icon: Award, count: getRecommendationsByCategory('quality_pick').length },
            { id: 'creator_pick', name: 'Yaratıcı Seçimi', icon: Users, count: getRecommendationsByCategory('creator_pick').length },
            { id: 'hidden_gem', name: 'Gizli İnci', icon: Eye, count: getRecommendationsByCategory('hidden_gem').length },
            { id: 'discovery', name: 'Keşif', icon: Lightbulb, count: getRecommendationsByCategory('discovery').length }
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
              <Brain className="w-6 h-6 text-purple-400" />
              <span>
                {activeCategory === 'all' ? 'Tüm Akıllı Öneriler' :
                 activeCategory === 'perfect_match' ? 'Mükemmel Eşleşmeler' :
                 activeCategory === 'quality_pick' ? 'Kalite Seçimleri' :
                 activeCategory === 'creator_pick' ? 'Yaratıcı Seçimleri' :
                 activeCategory === 'hidden_gem' ? 'Gizli İnciler' :
                 'Keşif Önerileri'}
              </span>
            </h3>
            <div className="text-sm text-gray-400">
              {activeCategory === 'all' 
                ? recommendations.length 
                : getRecommendationsByCategory(activeCategory).length
              } akıllı öneri
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(activeCategory === 'all' 
              ? recommendations 
              : getRecommendationsByCategory(activeCategory)
            ).map((recommendation) => (
              <div key={recommendation.content.id} className="relative">
                <EnhancedMovieCard
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
                  explanation={recommendation.reasoning.primary}
                  trailerKey={recommendation.trailerKey}
                  reasons={recommendation.reasoning.secondary}
                />
                
                {/* Kategori Badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  {recommendation.category === 'perfect_match' ? '🎯 Mükemmel' :
                   recommendation.category === 'quality_pick' ? '⭐ Kalite' :
                   recommendation.category === 'creator_pick' ? '👥 Yaratıcı' :
                   recommendation.category === 'hidden_gem' ? '💎 Gizli' :
                   recommendation.category === 'discovery' ? '🔍 Keşif' :
                   '📈 Trend'}
                </div>
                
                {/* Güven Skoru */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <Award className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-white font-medium">
                      %{Math.round(recommendation.confidence * 100)}
                    </span>
                  </div>
                </div>
                
                {/* Öncelik Göstergesi */}
                <div className="absolute bottom-4 right-4 bg-purple-600/80 backdrop-blur-sm rounded px-2 py-1">
                  <div className="text-xs text-white font-medium">
                    P:{recommendation.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {!isGenerating && recommendations.length === 0 && (
        <div className="text-center py-12 space-y-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Analiz Devam Ediyor</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Gelişmiş algoritma profilinizi analiz ediyor. Daha fazla içerik puanlayarak sonuçları iyileştirebilirsiniz.
            </p>
          </div>
          <button
            onClick={generateRecommendations}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
          >
            Analizi Başlat
          </button>
        </div>
      )}
    </div>
  );
};