import { useState, useEffect, useMemo } from 'react';
import { useUserProfile } from './useUserProfile';
import { useContent } from './useContent';

export interface AdvancedUserProfile {
  // Tür analizi
  genreAffinities: {
    [genreId: number]: {
      score: number;
      confidence: number;
      sampleSize: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      lastRated: number;
    };
  };
  
  // Kalite tercihleri
  qualityProfile: {
    averageRating: number;
    ratingVariance: number;
    qualityTolerance: number;
    preferredRange: { min: number; max: number };
    ratingPattern: 'generous' | 'critical' | 'balanced';
  };
  
  // Dönem tercihleri
  temporalPreferences: {
    [decade: string]: {
      score: number;
      count: number;
      averageRating: number;
    };
  };
  
  // İçerik tipi tercihleri
  contentTypeProfile: {
    moviePreference: number;
    tvPreference: number;
    preferredRuntime: { min: number; max: number };
    seasonPreference: number;
  };
  
  // Yaratıcı tercihleri
  creatorAffinities: {
    directors: { [id: number]: number };
    actors: { [id: number]: number };
    writers: { [id: number]: number };
    studios: { [id: number]: number };
  };
  
  // Davranışsal analiz
  behavioralProfile: {
    ratingFrequency: number;
    detailedRatingRatio: number;
    explorationTendency: number; // Yeni türleri deneme eğilimi
    consistencyScore: number; // Puanlama tutarlılığı
    recencyBias: number; // Yeni içeriklere yönelik önyargı
  };
  
  // Sosyal profil
  socialProfile: {
    followingCount: number;
    diversityIndex: number; // Takip edilen yaratıcıların çeşitliliği
    influenceScore: number; // Takip edilen yaratıcıların etkisi
  };
  
  // Meta bilgiler
  profileMetrics: {
    completeness: number; // Profil tamamlanma oranı
    reliability: number; // Profil güvenilirliği
    lastUpdated: number;
    dataPoints: number;
  };
}

export const useAdvancedUserProfiling = () => {
  const { profile, getTopGenres, getTopCreators, getTopStudios } = useUserProfile();
  const { genres } = useContent();
  
  const [advancedProfile, setAdvancedProfile] = useState<AdvancedUserProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Gelişmiş tür analizi
  const analyzeGenreAffinities = useMemo(() => {
    const genreAffinities: AdvancedUserProfile['genreAffinities'] = {};
    
    // Tüm puanlamaları birleştir
    const allRatings = [
      ...profile.ratings.map(r => ({ 
        rating: r.rating * 10, 
        timestamp: r.timestamp,
        contentId: r.contentId,
        contentType: r.contentType 
      })),
      ...profile.detailedRatings.map(r => ({ 
        rating: r.overall, 
        timestamp: r.timestamp,
        contentId: r.contentId,
        contentType: r.contentType 
      }))
    ];

    // Her tür için analiz
    Object.entries(profile.genrePreferences).forEach(([genreIdStr, baseScore]) => {
      const genreId = parseInt(genreIdStr);
      
      // Bu türdeki puanlamaları bul (basit yaklaşım - gerçekte content verisi gerekli)
      const genreRatings = allRatings.filter(r => Math.random() > 0.7); // Simülasyon
      
      if (genreRatings.length > 0) {
        const avgRating = genreRatings.reduce((sum, r) => sum + r.rating, 0) / genreRatings.length;
        const variance = genreRatings.reduce((sum, r) => sum + Math.pow(r.rating - avgRating, 2), 0) / genreRatings.length;
        
        // Trend analizi (son 3 ay vs önceki dönem)
        const recentThreshold = Date.now() - (90 * 24 * 60 * 60 * 1000);
        const recentRatings = genreRatings.filter(r => r.timestamp > recentThreshold);
        const olderRatings = genreRatings.filter(r => r.timestamp <= recentThreshold);
        
        const recentAvg = recentRatings.length > 0 
          ? recentRatings.reduce((sum, r) => sum + r.rating, 0) / recentRatings.length 
          : avgRating;
        const olderAvg = olderRatings.length > 0 
          ? olderRatings.reduce((sum, r) => sum + r.rating, 0) / olderRatings.length 
          : avgRating;
        
        let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
        if (recentAvg > olderAvg + 5) trend = 'increasing';
        else if (recentAvg < olderAvg - 5) trend = 'decreasing';
        
        genreAffinities[genreId] = {
          score: (baseScore * 10) + (avgRating - 50), // Normalize edilmiş skor
          confidence: Math.min(genreRatings.length / 5, 1), // 5 puanlama = %100 güven
          sampleSize: genreRatings.length,
          trend,
          lastRated: Math.max(...genreRatings.map(r => r.timestamp))
        };
      }
    });

    return genreAffinities;
  }, [profile.genrePreferences, profile.ratings, profile.detailedRatings]);

  // Kalite profili analizi
  const analyzeQualityProfile = useMemo(() => {
    const allRatings = [
      ...profile.ratings.map(r => r.rating * 10),
      ...profile.detailedRatings.map(r => r.overall)
    ];

    if (allRatings.length === 0) {
      return {
        averageRating: 50,
        ratingVariance: 0,
        qualityTolerance: 50,
        preferredRange: { min: 40, max: 80 },
        ratingPattern: 'balanced' as const
      };
    }

    const avgRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
    const variance = allRatings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / allRatings.length;
    const stdDev = Math.sqrt(variance);

    // Puanlama paterni analizi
    const highRatings = allRatings.filter(r => r >= 70).length;
    const lowRatings = allRatings.filter(r => r <= 40).length;
    const midRatings = allRatings.length - highRatings - lowRatings;

    let ratingPattern: 'generous' | 'critical' | 'balanced' = 'balanced';
    if (highRatings / allRatings.length > 0.6) ratingPattern = 'generous';
    else if (lowRatings / allRatings.length > 0.4) ratingPattern = 'critical';

    return {
      averageRating: avgRating,
      ratingVariance: variance,
      qualityTolerance: stdDev,
      preferredRange: {
        min: Math.max(avgRating - stdDev, 0),
        max: Math.min(avgRating + stdDev, 100)
      },
      ratingPattern
    };
  }, [profile.ratings, profile.detailedRatings]);

  // Dönem tercihleri analizi
  const analyzeTemporalPreferences = useMemo(() => {
    const temporalPreferences: AdvancedUserProfile['temporalPreferences'] = {};
    
    // Simülasyon - gerçekte content verilerinden çıkarılacak
    const decades = ['2020s', '2010s', '2000s', '1990s', '1980s', '1970s'];
    
    decades.forEach(decade => {
      // Rastgele simülasyon verisi
      const count = Math.floor(Math.random() * 10) + 1;
      const avgRating = 50 + (Math.random() - 0.5) * 40;
      
      temporalPreferences[decade] = {
        score: avgRating,
        count,
        averageRating: avgRating
      };
    });

    return temporalPreferences;
  }, [profile.ratings, profile.detailedRatings]);

  // İçerik tipi profili
  const analyzeContentTypeProfile = useMemo(() => {
    const movieRatings = profile.ratings.filter(r => r.contentType === 'movie');
    const tvRatings = profile.ratings.filter(r => r.contentType === 'tv');
    const total = movieRatings.length + tvRatings.length;

    const movieDetailedRatings = profile.detailedRatings.filter(r => r.contentType === 'movie');
    const tvDetailedRatings = profile.detailedRatings.filter(r => r.contentType === 'tv');

    const totalMovies = movieRatings.length + movieDetailedRatings.length;
    const totalTV = tvRatings.length + tvDetailedRatings.length;
    const grandTotal = totalMovies + totalTV;

    return {
      moviePreference: grandTotal > 0 ? (totalMovies / grandTotal) * 100 : 50,
      tvPreference: grandTotal > 0 ? (totalTV / grandTotal) * 100 : 50,
      preferredRuntime: { min: 90, max: 150 }, // Simülasyon
      seasonPreference: 3 // Ortalama tercih edilen sezon sayısı
    };
  }, [profile.ratings, profile.detailedRatings]);

  // Yaratıcı yakınlıkları
  const analyzeCreatorAffinities = useMemo(() => {
    const directors: { [id: number]: number } = {};
    const actors: { [id: number]: number } = {};
    const writers: { [id: number]: number } = {};
    const studios: { [id: number]: number } = {};

    // Yaratıcı profillerinden yakınlık skorları
    Object.values(profile.creatorProfiles).forEach(creator => {
      const score = creator.averageRating;
      switch (creator.type) {
        case 'director':
          directors[creator.id] = score;
          break;
        case 'actor':
          actors[creator.id] = score;
          break;
        case 'writer':
          writers[creator.id] = score;
          break;
      }
    });

    Object.values(profile.studioProfiles).forEach(studio => {
      studios[studio.id] = studio.averageRating;
    });

    return { directors, actors, writers, studios };
  }, [profile.creatorProfiles, profile.studioProfiles]);

  // Davranışsal profil
  const analyzeBehavioralProfile = useMemo(() => {
    const totalRatings = profile.ratings.length + profile.detailedRatings.length;
    const detailedRatio = totalRatings > 0 ? profile.detailedRatings.length / totalRatings : 0;
    
    // Son 30 gündeki aktivite
    const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentActivity = [...profile.ratings, ...profile.detailedRatings]
      .filter(r => r.timestamp > last30Days).length;
    
    const ratingFrequency = recentActivity / 30; // Günlük ortalama

    // Tür çeşitliliği (keşif eğilimi)
    const uniqueGenres = Object.keys(profile.genrePreferences).length;
    const explorationTendency = Math.min(uniqueGenres / 15, 1) * 100; // 15 tür = %100 keşif

    // Puanlama tutarlılığı
    const allRatings = [
      ...profile.ratings.map(r => r.rating * 10),
      ...profile.detailedRatings.map(r => r.overall)
    ];
    const avgRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
    const variance = allRatings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / allRatings.length;
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

    // Yenilik önyargısı (son 2 yıl vs eski içerik)
    const recencyBias = 60; // Simülasyon

    return {
      ratingFrequency,
      detailedRatingRatio: detailedRatio * 100,
      explorationTendency,
      consistencyScore,
      recencyBias
    };
  }, [profile.ratings, profile.detailedRatings, profile.genrePreferences]);

  // Sosyal profil
  const analyzeSocialProfile = useMemo(() => {
    const followingCount = profile.followedCreators.length + profile.followedStudios.length;
    
    // Çeşitlilik indeksi (farklı türdeki yaratıcılar)
    const creatorTypes = new Set(
      Object.values(profile.creatorProfiles)
        .filter(c => profile.followedCreators.includes(c.id))
        .map(c => c.type)
    );
    const diversityIndex = (creatorTypes.size / 3) * 100; // 3 tip yaratıcı var

    // Etki skoru (takip edilen yaratıcıların ortalama puanı)
    const followedCreators = Object.values(profile.creatorProfiles)
      .filter(c => profile.followedCreators.includes(c.id));
    const influenceScore = followedCreators.length > 0
      ? followedCreators.reduce((sum, c) => sum + c.averageRating, 0) / followedCreators.length
      : 0;

    return {
      followingCount,
      diversityIndex,
      influenceScore
    };
  }, [profile.followedCreators, profile.followedStudios, profile.creatorProfiles]);

  // Profil metrikleri
  const calculateProfileMetrics = useMemo(() => {
    const totalRatings = profile.ratings.length + profile.detailedRatings.length;
    const genreCount = Object.keys(profile.genrePreferences).length;
    const creatorCount = Object.keys(profile.creatorProfiles).length;
    const followingCount = profile.followedCreators.length + profile.followedStudios.length;

    // Tamamlanma oranı
    const completeness = Math.min(
      (totalRatings / 20) * 0.4 + // %40 - puanlamalar
      (genreCount / 15) * 0.3 + // %30 - tür çeşitliliği
      (creatorCount / 10) * 0.2 + // %20 - yaratıcı profilleri
      (followingCount / 5) * 0.1, // %10 - takip edilenler
      1
    ) * 100;

    // Güvenilirlik (veri kalitesi)
    const reliability = Math.min(
      (totalRatings / 10) * 0.5 + // Yeterli veri
      (profile.detailedRatings.length / Math.max(totalRatings, 1)) * 0.3 + // Detaylı puanlama oranı
      (genreCount / 10) * 0.2, // Tür çeşitliliği
      1
    ) * 100;

    return {
      completeness,
      reliability,
      lastUpdated: profile.lastUpdated,
      dataPoints: totalRatings + genreCount + creatorCount + followingCount
    };
  }, [profile]);

  // Ana profil oluşturma
  const buildAdvancedProfile = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newProfile: AdvancedUserProfile = {
        genreAffinities: analyzeGenreAffinities,
        qualityProfile: analyzeQualityProfile,
        temporalPreferences: analyzeTemporalPreferences,
        contentTypeProfile: analyzeContentTypeProfile,
        creatorAffinities: analyzeCreatorAffinities,
        behavioralProfile: analyzeBehavioralProfile,
        socialProfile: analyzeSocialProfile,
        profileMetrics: calculateProfileMetrics
      };
      
      setAdvancedProfile(newProfile);
      setIsAnalyzing(false);
    }, 1000);
  };

  // Profil değiştiğinde güncelle
  useEffect(() => {
    if (profile.ratings.length > 0 || profile.detailedRatings.length > 0) {
      buildAdvancedProfile();
    }
  }, [profile.lastUpdated]);

  return {
    advancedProfile,
    isAnalyzing,
    buildAdvancedProfile,
    profileMetrics: calculateProfileMetrics
  };
};