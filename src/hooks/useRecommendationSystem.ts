import { useState, useEffect } from 'react';
import { ContentItem } from '../types';

export interface UserRating {
  userId: string;
  itemId: number;
  rating: number;
  timestamp: number;
  contentType: 'movie' | 'tv';
}

export interface RecommendationData {
  ratings: UserRating[];
  users: string[];
  items: number[];
}

const STORAGE_KEY = 'recommendation_ratings';
const USER_ID_KEY = 'current_user_id';

// Generate sample data for initial testing
const generateSampleData = (): UserRating[] => {
  const sampleUsers = Array.from({ length: 25 }, (_, i) => `user_${i + 1}`);
  const sampleItems = [1, 2, 3, 4, 5, 6, 7, 8, 101, 102, 103, 104, 201, 202, 203, 204, 205, 206, 207, 208];
  const sampleRatings: UserRating[] = [];

  sampleUsers.forEach(userId => {
    // Each user rates 8-15 random items
    const numRatings = Math.floor(Math.random() * 8) + 8;
    const shuffledItems = [...sampleItems].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numRatings; i++) {
      const itemId = shuffledItems[i];
      // Generate realistic ratings (more 3-5 stars, fewer 1-2 stars)
      const rating = Math.random() < 0.7 
        ? Math.floor(Math.random() * 3) + 3  // 3-5 stars (70% chance)
        : Math.floor(Math.random() * 2) + 1; // 1-2 stars (30% chance)
      
      sampleRatings.push({
        userId,
        itemId,
        rating,
        timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Last 30 days
        contentType: itemId > 100 ? 'tv' : 'movie'
      });
    }
  });

  return sampleRatings;
};

export const useRecommendationSystem = () => {
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [recommendations, setRecommendations] = useState<number[]>([]);

  // Initialize system
  useEffect(() => {
    // Load existing ratings
    const storedRatings = localStorage.getItem(STORAGE_KEY);
    if (storedRatings) {
      try {
        setRatings(JSON.parse(storedRatings));
      } catch (error) {
        console.error('Error loading ratings:', error);
        // Initialize with sample data if loading fails
        const sampleData = generateSampleData();
        setRatings(sampleData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      }
    } else {
      // Initialize with sample data
      const sampleData = generateSampleData();
      setRatings(sampleData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
    }

    // Load or generate user ID
    let userId = localStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = `user_${Date.now()}`;
      localStorage.setItem(USER_ID_KEY, userId);
    }
    setCurrentUserId(userId);
  }, []);

  // Save ratings to localStorage whenever they change
  useEffect(() => {
    if (ratings.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    }
  }, [ratings]);

  const addRating = (itemId: number, rating: number, contentType: 'movie' | 'tv') => {
    const newRating: UserRating = {
      userId: currentUserId,
      itemId,
      rating,
      timestamp: Date.now(),
      contentType
    };

    setRatings(prev => {
      // Remove existing rating for this user-item pair
      const filtered = prev.filter(r => !(r.userId === currentUserId && r.itemId === itemId));
      return [...filtered, newRating];
    });
  };

  const getUserRating = (itemId: number): number => {
    const userRating = ratings.find(r => r.userId === currentUserId && r.itemId === itemId);
    return userRating ? userRating.rating : 0;
  };

  const exportRatings = () => {
    const exportData: RecommendationData = {
      ratings,
      users: [...new Set(ratings.map(r => r.userId))],
      items: [...new Set(ratings.map(r => r.itemId))]
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ratings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getRecommendationStats = () => {
    const userCount = new Set(ratings.map(r => r.userId)).size;
    const itemCount = new Set(ratings.map(r => r.itemId)).size;
    const currentUserRatings = ratings.filter(r => r.userId === currentUserId).length;
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    return {
      totalUsers: userCount,
      totalItems: itemCount,
      totalRatings: ratings.length,
      currentUserRatings,
      averageRating: avgRating
    };
  };

  // Simple collaborative filtering for basic recommendations
  const generateBasicRecommendations = (targetUserId: string = currentUserId): number[] => {
    const userRatings = ratings.filter(r => r.userId === targetUserId);
    const userItemIds = new Set(userRatings.map(r => r.itemId));
    
    // Find similar users based on common rated items
    const otherUsers = [...new Set(ratings.map(r => r.userId))].filter(u => u !== targetUserId);
    const similarities: { [userId: string]: number } = {};
    
    otherUsers.forEach(otherUserId => {
      const otherRatings = ratings.filter(r => r.userId === otherUserId);
      const commonItems = otherRatings.filter(r => userItemIds.has(r.itemId));
      
      if (commonItems.length > 0) {
        // Calculate similarity based on rating differences
        let similarity = 0;
        commonItems.forEach(otherRating => {
          const userRating = userRatings.find(r => r.itemId === otherRating.itemId);
          if (userRating) {
            similarity += 1 - Math.abs(userRating.rating - otherRating.rating) / 4;
          }
        });
        similarities[otherUserId] = similarity / commonItems.length;
      }
    });

    // Get recommendations from most similar users
    const sortedSimilarUsers = Object.entries(similarities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 similar users

    const recommendedItems: { [itemId: number]: number } = {};
    
    sortedSimilarUsers.forEach(([userId, similarity]) => {
      const userRatingsForRec = ratings.filter(r => r.userId === userId && r.rating >= 4);
      userRatingsForRec.forEach(rating => {
        if (!userItemIds.has(rating.itemId)) {
          recommendedItems[rating.itemId] = (recommendedItems[rating.itemId] || 0) + 
            rating.rating * similarity;
        }
      });
    });

    return Object.entries(recommendedItems)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([itemId]) => parseInt(itemId));
  };

  const updateRecommendations = () => {
    const newRecommendations = generateBasicRecommendations();
    setRecommendations(newRecommendations);
  };

  return {
    ratings,
    currentUserId,
    recommendations,
    addRating,
    getUserRating,
    exportRatings,
    getRecommendationStats,
    updateRecommendations,
    generateBasicRecommendations
  };
};