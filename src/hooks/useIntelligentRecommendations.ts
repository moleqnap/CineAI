import { useState, useEffect, useMemo } from 'react';
import { ContentItem } from '../types';
import { useAdvancedUserProfiling } from './useAdvancedUserProfiling';
import { useUserProfile } from './useUserProfile';
import { useContent } from './useContent';
import { discoverPersonalizedContent, getContentVideos } from '../services/tmdbApi';

export interface IntelligentRecommendation {
  content: ContentItem;
  matchScore: number;
  confidence: number;
  reasoning: {
    primary: string;
    secondary: string[];
    factors: {
      genreMatch: number;
      qualityMatch: number;
      temporalMatch: number;
      creatorMatch: number;
      behavioralMatch: number;
      socialMatch: number;
    };
  };
  category: 'perfect_match' | 'quality_pick' | 'discovery' | 'trending' | 'hidden_gem' | 'creator_pick';
  priority: number;
  trailerKey?: string;
  metadata: {
    releaseDecade: string;
    qualityTier: 'excellent' | 'good' | 'decent';
    noveltyScore: number;
    popularityTier: 'mainstream' | 'popular' | 'niche';
  };
}

export interface RecommendationInsights {
  totalAnalyzed: number;
  averageMatchScore: number;
  categoryDistribution: { [category: string]: number };
  confidenceLevel: number;
  diversityScore: number;
  noveltyBalance: number;
  qualityAssurance: number;
}

export const useIntelligentRecommendations = () => {
  const { advancedProfile, isAnalyzing: isProfileAnalyzing } = useAdvancedUserProfiling();
  const { profile } = useUserProfile();
  const { genres } = useContent();
  
  const [recommendations, setRecommendations] = useState<IntelligentRecommendation[]>([]);
  const [insights, setInsights] = useState<RecommendationInsights | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<number>(0);

  // Puanlanmış içerikleri al
  const ratedContentIds = useMemo(() => {
    return new Set([
      ...profile.ratings.map(r => r.contentId),
      ...profile.detailedRatings.map(r => r.contentId)
    ]);
  }, [profile.ratings, profile.detailedRatings]);

  // Gelişmiş eşleştirme algoritması
  const calculateIntelligentMatch = (content: ContentItem): IntelligentRecommendation => {
    if (!advancedProfile) {
      // Fallback basit eşleştirme
      return createBasicRecommendation(content);
    }

    const factors = {
      genreMatch: calculateGenreMatch(content),
      qualityMatch: calculateQualityMatch(content),
      temporalMatch: calculateTemporalMatch(content),
      creatorMatch: calculateCreatorMatch(content),
      behavioralMatch: calculateBehavioralMatch(content),
      socialMatch: calculateSocialMatch(content)
    };

    // Ağırlıklı skor hesaplama
    const weights = {
      genreMatch: 0.35,      // %35 - En önemli faktör
      qualityMatch: 0.25,    // %25 - Kalite tercihi
      temporalMatch: 0.15,   // %15 - Dönem tercihi
      creatorMatch: 0.10,    // %10 - Yaratıcı tercihi
      behavioralMatch: 0.10, // %10 - Davranışsal uyum
      socialMatch: 0.05      // %5 - Sosyal etki
    };

    const matchScore = Object.entries(factors).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof typeof weights]);
    }, 0);

    // Güven skoru hesaplama
    const confidence = calculateConfidence(factors, content);

    // Kategori belirleme
    const category = determineCategory(factors, matchScore, content);

    // Öncelik hesaplama
    const priority = calculatePriority(matchScore, confidence, category);

    // Açıklama oluşturma
    const reasoning = generateReasoning(factors, content);

    // Metadata oluşturma
    const metadata = generateMetadata(content);

    return {
      content,
      matchScore: Math.round(matchScore),
      confidence: Math.round(confidence * 100) / 100,
      reasoning,
      category,
      priority,
      metadata
    };
  };

  // Tür eşleşmesi hesaplama
  const calculateGenreMatch = (content: ContentItem): number => {
    if (!advancedProfile) return 50;

    const contentGenres = content.genre_ids || [];
    let totalScore = 0;
    let weightSum = 0;

    contentGenres.forEach(genreId => {
      const affinity = advancedProfile.genreAffinities[genreId];
      if (affinity) {
        const weight = affinity.confidence;
        totalScore += affinity.score * weight;
        weightSum += weight;
      }
    });

    if (weightSum === 0) return 50; // Neutral score

    const baseScore = totalScore / weightSum;
    
    // Trend bonusu
    const trendBonus = contentGenres.reduce((bonus, genreId) => {
      const affinity = advancedProfile.genreAffinities[genreId];
      if (affinity?.trend === 'increasing') return bonus + 5;
      if (affinity?.trend === 'decreasing') return bonus - 3;
      return bonus;
    }, 0);

    return Math.max(0, Math.min(100, baseScore + trendBonus));
  };

  // Kalite eşleşmesi hesaplama
  const calculateQualityMatch = (content: ContentItem): number => {
    if (!advancedProfile) return content.vote_average * 10;

    const contentRating = content.vote_average * 10;
    const userProfile = advancedProfile.qualityProfile;

    // Kullanıcının tercih ettiği kalite aralığında mı?
    const inPreferredRange = contentRating >= userProfile.preferredRange.min && 
                            contentRating <= userProfile.preferredRange.max;

    if (inPreferredRange) {
      return 90 + (contentRating - userProfile.averageRating) / 10;
    }

    // Aralık dışında - mesafeye göre ceza
    const distance = Math.min(
      Math.abs(contentRating - userProfile.preferredRange.min),
      Math.abs(contentRating - userProfile.preferredRange.max)
    );

    return Math.max(0, 70 - distance);
  };

  // Dönem eşleşmesi hesaplama
  const calculateTemporalMatch = (content: ContentItem): number => {
    if (!advancedProfile) return 60;

    const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
    const decade = `${Math.floor(releaseYear / 10) * 10}s`;

    const temporalPref = advancedProfile.temporalPreferences[decade];
    if (temporalPref) {
      return Math.min(100, temporalPref.score + (temporalPref.count * 2));
    }

    // Yenilik önyargısı uygula
    const currentYear = new Date().getFullYear();
    const contentAge = currentYear - releaseYear;
    const recencyBias = advancedProfile.behavioralProfile.recencyBias;

    if (contentAge <= 3) {
      return 60 + (recencyBias / 100) * 30;
    } else if (contentAge <= 10) {
      return 60;
    } else {
      return Math.max(30, 60 - (contentAge - 10) * 2);
    }
  };

  // Yaratıcı eşleşmesi hesaplama
  const calculateCreatorMatch = (content: ContentItem): number => {
    if (!advancedProfile) return 50;

    // Simülasyon - gerçekte content credits verisi gerekli
    const hasPreferredCreator = Math.random() > 0.7;
    
    if (hasPreferredCreator) {
      return 80 + Math.random() * 20;
    }

    return 40 + Math.random() * 20;
  };

  // Davranışsal eşleşme hesaplama
  const calculateBehavioralMatch = (content: ContentItem): number => {
    if (!advancedProfile) return 50;

    const behavioral = advancedProfile.behavioralProfile;
    let score = 50;

    // Keşif eğilimi
    const isNewGenre = (content.genre_ids || []).some(genreId => 
      !advancedProfile.genreAffinities[genreId] || 
      advancedProfile.genreAffinities[genreId].sampleSize < 3
    );

    if (isNewGenre) {
      score += (behavioral.explorationTendency / 100) * 20;
    }

    // İçerik tipi tercihi
    const isMovie = 'title' in content;
    const contentTypePref = advancedProfile.contentTypeProfile;
    
    if (isMovie) {
      score += (contentTypePref.moviePreference - 50) / 5;
    } else {
      score += (contentTypePref.tvPreference - 50) / 5;
    }

    return Math.max(0, Math.min(100, score));
  };

  // Sosyal eşleşme hesaplama
  const calculateSocialMatch = (content: ContentItem): number => {
    if (!advancedProfile) return 50;

    const social = advancedProfile.socialProfile;
    
    // Takip edilen yaratıcıların etkisi
    const influenceBonus = (social.influenceScore - 50) / 10;
    
    // Çeşitlilik bonusu
    const diversityBonus = social.diversityIndex / 10;

    return Math.max(0, Math.min(100, 50 + influenceBonus + diversityBonus));
  };

  // Güven skoru hesaplama
  const calculateConfidence = (factors: any, content: ContentItem): number => {
    if (!advancedProfile) return 0.5;

    const profileReliability = advancedProfile.profileMetrics.reliability / 100;
    const dataCompleteness = advancedProfile.profileMetrics.completeness / 100;
    
    // Faktör tutarlılığı
    const factorValues = Object.values(factors) as number[];
    const avgFactor = factorValues.reduce((sum, val) => sum + val, 0) / factorValues.length;
    const variance = factorValues.reduce((sum, val) => sum + Math.pow(val - avgFactor, 2), 0) / factorValues.length;
    const consistency = Math.max(0, 1 - Math.sqrt(variance) / 50);

    // İçerik kalitesi
    const contentQuality = Math.min(1, content.vote_average / 8);

    return (profileReliability * 0.4 + dataCompleteness * 0.3 + consistency * 0.2 + contentQuality * 0.1);
  };

  // Kategori belirleme
  const determineCategory = (factors: any, matchScore: number, content: ContentItem): IntelligentRecommendation['category'] => {
    if (matchScore >= 85) return 'perfect_match';
    if (content.vote_average >= 8.0) return 'quality_pick';
    if (factors.creatorMatch >= 80) return 'creator_pick';
    if (content.vote_average >= 7.5 && content.vote_average < 8.0) return 'hidden_gem';
    if (matchScore >= 70) return 'discovery';
    return 'trending';
  };

  // Öncelik hesaplama
  const calculatePriority = (matchScore: number, confidence: number, category: IntelligentRecommendation['category']): number => {
    const categoryWeights = {
      perfect_match: 100,
      quality_pick: 90,
      creator_pick: 85,
      hidden_gem: 80,
      discovery: 70,
      trending: 60
    };

    const baseScore = categoryWeights[category];
    const confidenceBonus = confidence * 20;
    const matchBonus = (matchScore - 50) / 5;

    return Math.round(baseScore + confidenceBonus + matchBonus);
  };

  // Açıklama oluşturma
  const generateReasoning = (factors: any, content: ContentItem): IntelligentRecommendation['reasoning'] => {
    const topFactors = Object.entries(factors)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);

    const factorNames = {
      genreMatch: 'tür tercihinize',
      qualityMatch: 'kalite beklentinize',
      temporalMatch: 'dönem tercihinize',
      creatorMatch: 'sevdiğiniz yaratıcılara',
      behavioralMatch: 'izleme alışkanlıklarınıza',
      socialMatch: 'sosyal tercihlerinize'
    };

    const primary = `Bu içerik ${factorNames[topFactors[0][0] as keyof typeof factorNames]} uygun`;
    
    const secondary = topFactors.slice(1).map(([factor, score]) => 
      `${factorNames[factor as keyof typeof factorNames]} %${Math.round(score as number)} uyumlu`
    );

    return {
      primary,
      secondary,
      factors
    };
  };

  // Metadata oluşturma
  const generateMetadata = (content: ContentItem): IntelligentRecommendation['metadata'] => {
    const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
    const decade = `${Math.floor(releaseYear / 10) * 10}s`;

    const qualityTier = content.vote_average >= 8.0 ? 'excellent' : 
                       content.vote_average >= 7.0 ? 'good' : 'decent';

    const currentYear = new Date().getFullYear();
    const noveltyScore = Math.max(0, 100 - (currentYear - releaseYear) * 2);

    const popularityTier = content.vote_average >= 8.0 ? 'mainstream' : 
                          content.vote_average >= 6.5 ? 'popular' : 'niche';

    return {
      releaseDecade: decade,
      qualityTier,
      noveltyScore,
      popularityTier
    };
  };

  // Basit öneri oluşturma (fallback)
  const createBasicRecommendation = (content: ContentItem): IntelligentRecommendation => {
    const matchScore = content.vote_average * 10;
    
    return {
      content,
      matchScore: Math.round(matchScore),
      confidence: 0.5,
      reasoning: {
        primary: 'Genel kalite değerlendirmesine göre',
        secondary: ['Yüksek puanlı içerik'],
        factors: {
          genreMatch: 50,
          qualityMatch: matchScore,
          temporalMatch: 50,
          creatorMatch: 50,
          behavioralMatch: 50,
          socialMatch: 50
        }
      },
      category: 'trending',
      priority: Math.round(matchScore),
      metadata: generateMetadata(content)
    };
  };

  // Ana öneri üretme fonksiyonu
  const generateIntelligentRecommendations = async (): Promise<IntelligentRecommendation[]> => {
    if (!advancedProfile || advancedProfile.profileMetrics.completeness < 20) {
      return [];
    }

    setIsGenerating(true);
    
    try {
      const allRecommendations: IntelligentRecommendation[] = [];

      // En iyi türlerden içerik keşfi
      const topGenres = Object.entries(advancedProfile.genreAffinities)
        .sort(([, a], [, b]) => b.score - a.score)
        .slice(0, 5)
        .map(([genreId]) => parseInt(genreId));

      // Kalite aralığı belirleme
      const qualityProfile = advancedProfile.qualityProfile;
      const minRating = Math.max(6.0, qualityProfile.preferredRange.min / 10);

      // Çeşitli kaynaklardan içerik toplama
      const sources = [
        // Tür bazlı keşif
        { genreIds: topGenres.slice(0, 3), minRating, category: 'genre_based' },
        // Kalite odaklı keşif
        { genreIds: topGenres.slice(0, 2), minRating: 7.5, category: 'quality_focused' },
        // Keşif odaklı (yeni türler)
        { genreIds: [], minRating: 7.0, category: 'discovery' }
      ];

      for (const source of sources) {
        const content = await discoverPersonalizedContent({
          contentType: 'all',
          genreIds: source.genreIds,
          minRating: source.minRating,
          excludeIds: Array.from(ratedContentIds),
          page: Math.floor(Math.random() * 3) + 1
        });

        for (const item of content.slice(0, 15)) {
          const recommendation = calculateIntelligentMatch(item);
          
          // Minimum eşleşme skoru kontrolü
          if (recommendation.matchScore >= 60) {
            // Trailer bilgisi ekle
            try {
              const videos = await getContentVideos(item.id, 'title' in item ? 'movie' : 'tv');
              const trailer = videos.find(v => v.type === 'Trailer') || videos[0];
              if (trailer) {
                recommendation.trailerKey = trailer.key;
              }
            } catch (error) {
              // Trailer yüklenemezse devam et
            }

            allRecommendations.push(recommendation);
          }
        }
      }

      // Tekrarları kaldır ve sırala
      const uniqueRecommendations = allRecommendations
        .filter((rec, index, self) => 
          index === self.findIndex(r => r.content.id === rec.content.id)
        )
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 30);

      return uniqueRecommendations;

    } catch (error) {
      console.error('Error generating intelligent recommendations:', error);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  // İçgörüler oluşturma
  const generateInsights = (recommendations: IntelligentRecommendation[]): RecommendationInsights => {
    if (recommendations.length === 0) {
      return {
        totalAnalyzed: 0,
        averageMatchScore: 0,
        categoryDistribution: {},
        confidenceLevel: 0,
        diversityScore: 0,
        noveltyBalance: 0,
        qualityAssurance: 0
      };
    }

    const avgMatchScore = recommendations.reduce((sum, rec) => sum + rec.matchScore, 0) / recommendations.length;
    const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;

    const categoryDistribution = recommendations.reduce((dist, rec) => {
      dist[rec.category] = (dist[rec.category] || 0) + 1;
      return dist;
    }, {} as { [category: string]: number });

    // Çeşitlilik skoru (farklı kategorilerin dağılımı)
    const categoryCount = Object.keys(categoryDistribution).length;
    const diversityScore = Math.min(categoryCount / 6, 1) * 100;

    // Yenilik dengesi
    const avgNovelty = recommendations.reduce((sum, rec) => sum + rec.metadata.noveltyScore, 0) / recommendations.length;

    // Kalite güvencesi
    const highQualityCount = recommendations.filter(rec => rec.metadata.qualityTier === 'excellent').length;
    const qualityAssurance = (highQualityCount / recommendations.length) * 100;

    return {
      totalAnalyzed: recommendations.length,
      averageMatchScore: Math.round(avgMatchScore),
      categoryDistribution,
      confidenceLevel: Math.round(avgConfidence * 100),
      diversityScore: Math.round(diversityScore),
      noveltyBalance: Math.round(avgNovelty),
      qualityAssurance: Math.round(qualityAssurance)
    };
  };

  // Ana çalıştırma fonksiyonu
  const generateRecommendations = async () => {
    if (isProfileAnalyzing || !advancedProfile) return;

    const newRecommendations = await generateIntelligentRecommendations();
    const newInsights = generateInsights(newRecommendations);
    
    setRecommendations(newRecommendations);
    setInsights(newInsights);
    setLastGenerated(Date.now());
  };

  // Otomatik güncelleme
  useEffect(() => {
    if (advancedProfile && !isProfileAnalyzing) {
      const shouldGenerate = 
        recommendations.length === 0 || 
        Date.now() - lastGenerated > 10 * 60 * 1000; // 10 dakika

      if (shouldGenerate) {
        const timeoutId = setTimeout(generateRecommendations, 1000);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [advancedProfile, isProfileAnalyzing]);

  // Kategori bazlı filtreleme
  const getRecommendationsByCategory = (category: string) => {
    return recommendations.filter(rec => rec.category === category);
  };

  return {
    recommendations,
    insights,
    isGenerating,
    lastGenerated,
    generateRecommendations,
    getRecommendationsByCategory,
    hasEnoughData: advancedProfile?.profileMetrics.completeness >= 20
  };
};