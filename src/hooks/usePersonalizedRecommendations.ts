import { useState, useEffect, useMemo } from 'react';
import { ContentItem } from '../types';
import { useUserProfile } from './useUserProfile';
import { useContent } from './useContent';
import { discoverContent, getMovieDetails, getTVShowDetails } from '../services/tmdbApi';

export interface PersonalizedRecommendation {
  content: ContentItem;
  score: number;
  confidence: number;
  reasons: string[];
  category: 'genre_match' | 'decade_match' | 'quality_match' | 'discovery' | 'similar_taste';
  releaseDecade: string;
  matchPercentage: number;
}

export interface UserPreferenceStats {
  genreDistribution: { [genre: string]: number };
  decadeDistribution: { [decade: string]: number };
  averageRating: number;
  contentTypePreference: { movies: number; tvShows: number };
  ratingDistribution: { [rating: number]: number };
  totalRatings: number;
  preferredQualityRange: { min: number; max: number };
}

export interface RecommendationFilters {
  contentType: 'all' | 'movie' | 'tv';
  genres: number[];
  decades: string[];
  minRating: number;
  maxRating: number;
  sortBy: 'score' | 'rating' | 'release_date' | 'match_percentage';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: RecommendationFilters = {
  contentType: 'all',
  genres: [],
  decades: [],
  minRating: 0,
  maxRating: 10,
  sortBy: 'score',
  sortOrder: 'desc'
};

// Dönem hesaplama yardımcı fonksiyonu
const getDecadeFromYear = (year: number): string => {
  const decade = Math.floor(year / 10) * 10;
  return `${decade}'ler`;
};

// İçerik kalite kategorisi belirleme
const getQualityCategory = (rating: number): string => {
  if (rating >= 8.5) return 'Mükemmel';
  if (rating >= 7.5) return 'Çok İyi';
  if (rating >= 6.5) return 'İyi';
  if (rating >= 5.5) return 'Orta';
  return 'Düşük';
};

export const usePersonalizedRecommendations = () => {
  const { profile, getTopGenres } = useUserProfile();
  const { genres, discoverContentWithFilters } = useContent();
  
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS);

  // Kullanıcı tercih istatistiklerini hesapla
  const userStats = useMemo((): UserPreferenceStats => {
    const allRatings = [
      ...profile.ratings.map(r => ({ 
        rating: r.rating, 
        contentId: r.contentId, 
        contentType: r.contentType,
        timestamp: r.timestamp 
      })),
      ...profile.detailedRatings.map(r => ({ 
        rating: r.overall / 10, 
        contentId: r.contentId, 
        contentType: r.contentType,
        timestamp: r.timestamp 
      }))
    ];

    if (allRatings.length === 0) {
      return {
        genreDistribution: {},
        decadeDistribution: {},
        averageRating: 0,
        contentTypePreference: { movies: 0, tvShows: 0 },
        ratingDistribution: {},
        totalRatings: 0,
        preferredQualityRange: { min: 0, max: 10 }
      };
    }

    // Tür dağılımı
    const genreDistribution: { [genre: string]: number } = {};
    Object.entries(profile.genrePreferences).forEach(([genreId, score]) => {
      const genre = genres.find(g => g.id === parseInt(genreId));
      if (genre && score > 5) {
        genreDistribution[genre.name] = ((score - 5) / 5) * 100;
      }
    });

    // İçerik tipi tercihi
    const movieCount = allRatings.filter(r => r.contentType === 'movie').length;
    const tvCount = allRatings.filter(r => r.contentType === 'tv').length;
    const total = movieCount + tvCount;

    // Ortalama puan
    const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // Puan dağılımı
    const ratingDistribution: { [rating: number]: number } = {};
    allRatings.forEach(r => {
      const roundedRating = Math.round(r.rating);
      ratingDistribution[roundedRating] = (ratingDistribution[roundedRating] || 0) + 1;
    });

    // Tercih edilen kalite aralığı
    const sortedRatings = allRatings.map(r => r.rating).sort((a, b) => b - a);
    const topQuartileIndex = Math.floor(sortedRatings.length * 0.25);
    const preferredQualityRange = {
      min: Math.max(averageRating - 1, 0),
      max: sortedRatings[topQuartileIndex] || 10
    };

    return {
      genreDistribution,
      decadeDistribution: {}, // Bu gerçek verilerle doldurulacak
      averageRating,
      contentTypePreference: {
        movies: total > 0 ? (movieCount / total) * 100 : 50,
        tvShows: total > 0 ? (tvCount / total) * 100 : 50
      },
      ratingDistribution,
      totalRatings: allRatings.length,
      preferredQualityRange
    };
  }, [profile, genres]);

  // Puanlanmış içeriklerin ID'lerini al
  const ratedContentIds = useMemo(() => {
    return new Set([
      ...profile.ratings.map(r => r.contentId),
      ...profile.detailedRatings.map(r => r.contentId)
    ]);
  }, [profile.ratings, profile.detailedRatings]);

  // İçerik puanlama algoritması
  const scoreContent = (content: ContentItem): PersonalizedRecommendation => {
    let score = 0;
    let confidence = 0.3;
    const reasons: string[] = [];
    let category: PersonalizedRecommendation['category'] = 'discovery';

    // Temel kalite puanı
    const qualityScore = content.vote_average * 10;
    score += qualityScore * 0.3;

    // Tür eşleşmesi
    const contentGenres = content.genre_ids || [];
    let genreMatchScore = 0;
    let genreMatches = 0;

    contentGenres.forEach(genreId => {
      const preference = profile.genrePreferences[genreId];
      if (preference && preference > 6) {
        const genreBonus = (preference - 5) * 20;
        genreMatchScore += genreBonus;
        genreMatches++;
        
        const genre = genres.find(g => g.id === genreId);
        if (genre) {
          reasons.push(`${genre.name} türünü seviyorsunuz`);
        }
      }
    });

    if (genreMatches > 0) {
      score += genreMatchScore;
      confidence += Math.min(genreMatches * 0.2, 0.5);
      category = 'genre_match';
    }

    // Dönem tercihi
    const releaseYear = new Date('release_date' in content ? content.release_date : content.first_air_date).getFullYear();
    const decade = getDecadeFromYear(releaseYear);
    
    // Kullanıcının dönem tercihlerini analiz et (basit yaklaşım)
    const currentYear = new Date().getFullYear();
    const contentAge = currentYear - releaseYear;
    
    if (contentAge >= 20 && contentAge <= 40) {
      score += 15;
      reasons.push('Klasik dönem tercihinize uygun');
      category = 'decade_match';
    } else if (contentAge <= 5) {
      score += 10;
      reasons.push('Güncel içerik');
    }

    // Kalite eşleşmesi
    if (content.vote_average >= userStats.preferredQualityRange.min && 
        content.vote_average <= userStats.preferredQualityRange.max) {
      score += 25;
      confidence += 0.2;
      reasons.push('Kalite tercihinize uygun');
      category = 'quality_match';
    }

    // İçerik tipi tercihi
    const isMovie = 'title' in content;
    if (isMovie && userStats.contentTypePreference.movies > 60) {
      score += 10;
    } else if (!isMovie && userStats.contentTypePreference.tvShows > 60) {
      score += 10;
    }

    // Çeşitlilik bonusu (aynı türden çok fazla öneri yapılmasını önle)
    if (genreMatches <= 2) {
      score += 5;
      reasons.push('Yeni tür keşfi');
    }

    // Gizli inci bonusu (yüksek puan, düşük popülerlik)
    if (content.vote_average >= 7.5 && content.vote_average < 8.5) {
      score += 20;
      confidence += 0.15;
      reasons.push('Gözden kaçmış kaliteli yapım');
      category = 'discovery';
    }

    // Eşleşme yüzdesi hesapla
    const maxPossibleScore = 100;
    const matchPercentage = Math.min((score / maxPossibleScore) * 100, 100);

    return {
      content,
      score: Math.max(0, score),
      confidence: Math.max(0.1, Math.min(1.0, confidence)),
      reasons: reasons.slice(0, 3),
      category,
      releaseDecade: decade,
      matchPercentage
    };
  };

  // Kişiselleştirilmiş içerik keşfi
  const discoverPersonalizedContent = async (): Promise<PersonalizedRecommendation[]> => {
    if (userStats.totalRatings < 3) {
      // Yeni kullanıcı için çeşitli kaliteli içerik
      const trendingContent = await discoverContentWithFilters({
        contentType: 'all',
        sortBy: 'rating',
        sortOrder: 'desc'
      });

      return trendingContent
        .filter(content => !ratedContentIds.has(content.id))
        .slice(0, 20)
        .map(content => scoreContent(content));
    }

    const allRecommendations: PersonalizedRecommendation[] = [];
    const topGenres = getTopGenres(5);

    try {
      // 1. Tür bazlı keşif
      for (const genreData of topGenres) {
        const genreContent = await discoverContentWithFilters({
          contentType: 'all',
          genreIds: [genreData.genreId],
          sortBy: 'rating',
          sortOrder: 'desc'
        });

        const filteredContent = genreContent
          .filter(content => !ratedContentIds.has(content.id))
          .slice(0, 8);

        filteredContent.forEach(content => {
          const recommendation = scoreContent(content);
          allRecommendations.push(recommendation);
        });
      }

      // 2. Dönem bazlı keşif
      const decades = ['2020', '2010', '2000', '1990', '1980'];
      for (const decade of decades) {
        const decadeContent = await discoverContentWithFilters({
          contentType: 'all',
          year: decade,
          sortBy: 'rating',
          sortOrder: 'desc'
        });

        const filteredContent = decadeContent
          .filter(content => !ratedContentIds.has(content.id))
          .slice(0, 5);

        filteredContent.forEach(content => {
          const recommendation = scoreContent(content);
          allRecommendations.push(recommendation);
        });
      }

      // 3. Kalite bazlı keşif
      const qualityContent = await discoverContentWithFilters({
        contentType: 'all',
        sortBy: 'rating',
        sortOrder: 'desc'
      });

      const highQualityContent = qualityContent
        .filter(content => 
          !ratedContentIds.has(content.id) &&
          content.vote_average >= userStats.preferredQualityRange.min
        )
        .slice(0, 15);

      highQualityContent.forEach(content => {
        const recommendation = scoreContent(content);
        allRecommendations.push(recommendation);
      });

      // Tekrarları kaldır ve sırala
      const uniqueRecommendations = allRecommendations
        .filter((rec, index, self) => 
          index === self.findIndex(r => r.content.id === rec.content.id)
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 50);

      return uniqueRecommendations;

    } catch (error) {
      console.error('Kişiselleştirilmiş içerik keşfinde hata:', error);
      return [];
    }
  };

  // Filtrelenmiş önerileri al
  const getFilteredRecommendations = () => {
    let filtered = [...recommendations];

    // İçerik tipi filtresi
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(rec => {
        const isMovie = 'title' in rec.content;
        return filters.contentType === 'movie' ? isMovie : !isMovie;
      });
    }

    // Tür filtresi
    if (filters.genres.length > 0) {
      filtered = filtered.filter(rec => 
        rec.content.genre_ids?.some(genreId => filters.genres.includes(genreId))
      );
    }

    // Dönem filtresi
    if (filters.decades.length > 0) {
      filtered = filtered.filter(rec => 
        filters.decades.includes(rec.releaseDecade)
      );
    }

    // Puan filtresi
    filtered = filtered.filter(rec => 
      rec.content.vote_average >= filters.minRating && 
      rec.content.vote_average <= filters.maxRating
    );

    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'rating':
          aValue = a.content.vote_average;
          bValue = b.content.vote_average;
          break;
        case 'release_date':
          aValue = new Date('release_date' in a.content ? a.content.release_date : a.content.first_air_date).getTime();
          bValue = new Date('release_date' in b.content ? b.content.release_date : b.content.first_air_date).getTime();
          break;
        case 'match_percentage':
          aValue = a.matchPercentage;
          bValue = b.matchPercentage;
          break;
        default:
          return 0;
      }

      return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    return filtered;
  };

  // Ana analiz ve öneri fonksiyonu
  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    try {
      const personalizedRecs = await discoverPersonalizedContent();
      setRecommendations(personalizedRecs);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Analiz hatası:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Profil değiştiğinde otomatik güncelleme
  useEffect(() => {
    const shouldUpdate = 
      userStats.totalRatings >= 1 && 
      (Date.now() - lastUpdate > 2 * 60 * 1000 || recommendations.length === 0);

    if (shouldUpdate) {
      const timeoutId = setTimeout(analyzeAndRecommend, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [userStats.totalRatings, profile.genrePreferences]);

  // Kategori bazlı önerileri al
  const getRecommendationsByCategory = (category: PersonalizedRecommendation['category']) => {
    return recommendations.filter(rec => rec.category === category);
  };

  // Dönem bazlı önerileri al
  const getRecommendationsByDecade = (decade: string) => {
    return recommendations.filter(rec => rec.releaseDecade === decade);
  };

  return {
    recommendations: getFilteredRecommendations(),
    allRecommendations: recommendations,
    userStats,
    isAnalyzing,
    lastUpdate,
    filters,
    setFilters,
    analyzeAndRecommend,
    getRecommendationsByCategory,
    getRecommendationsByDecade,
    hasEnoughData: userStats.totalRatings >= 3,
    ratedContentIds
  };
};