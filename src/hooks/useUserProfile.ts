import { useState, useEffect } from 'react';
import { UserProfile, UserRating, DetailedRating, Mood, CreatorProfile, StudioProfile } from '../types';

const STORAGE_KEY = 'movieapp_user_profile';

const defaultProfile: UserProfile = {
  ratings: [],
  detailedRatings: [],
  genrePreferences: {},
  creatorProfiles: {},
  studioProfiles: {},
  followedCreators: [],
  followedStudios: [],
  favoriteActors: [],
  favoriteDirectors: [],
  favoriteStudios: [],
  watchlist: [],
  lastUpdated: Date.now()
};

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedProfile = JSON.parse(stored);
        // Ensure the profile has all required fields
        setProfile({
          ...defaultProfile,
          ...parsedProfile,
          detailedRatings: parsedProfile.detailedRatings || [],
          creatorProfiles: parsedProfile.creatorProfiles || {},
          studioProfiles: parsedProfile.studioProfiles || {},
          followedCreators: parsedProfile.followedCreators || [],
          followedStudios: parsedProfile.followedStudios || [],
          lastUpdated: parsedProfile.lastUpdated || Date.now()
        });
      } catch (error) {
        console.error('Error loading user profile:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveProfile = (newProfile: UserProfile) => {
    const updatedProfile = { ...newProfile, lastUpdated: Date.now() };
    setProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  const addRating = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    const newRating: UserRating = {
      contentId,
      contentType,
      rating,
      timestamp: Date.now()
    };

    // Remove existing rating for the same content
    const updatedRatings = [...profile.ratings.filter(r => r.contentId !== contentId), newRating];
    const updatedGenrePreferences = { ...profile.genrePreferences };

    // Update genre preferences based on rating
    genreIds.forEach(genreId => {
      const currentPref = updatedGenrePreferences[genreId] || 5;
      
      let adjustment = 0;
      if (rating >= 8) {
        adjustment = 1.5;
      } else if (rating >= 6) {
        adjustment = 0.8;
      } else if (rating >= 4) {
        adjustment = 0.2;
      } else if (rating >= 2) {
        adjustment = -0.5;
      } else {
        adjustment = -1;
      }

      const newPref = currentPref + (adjustment * (1 - Math.abs(currentPref - 5) / 5));
      updatedGenrePreferences[genreId] = Math.max(1, Math.min(10, newPref));
    });

    const updatedProfile: UserProfile = {
      ...profile,
      ratings: updatedRatings,
      genrePreferences: updatedGenrePreferences
    };

    saveProfile(updatedProfile);
  };

  const addDetailedRating = (detailedRating: DetailedRating, credits?: any, studios?: any[]) => {
    // Remove existing detailed rating for the same content
    const updatedDetailedRatings = [
      ...profile.detailedRatings.filter(r => r.contentId !== detailedRating.contentId),
      detailedRating
    ];

    // Also remove simple rating if exists and add equivalent
    const updatedRatings = [
      ...profile.ratings.filter(r => r.contentId !== detailedRating.contentId),
      {
        contentId: detailedRating.contentId,
        contentType: detailedRating.contentType,
        rating: detailedRating.overall / 10, // Convert 0-100 to 0-10 scale
        timestamp: detailedRating.timestamp
      }
    ];

    let updatedCreatorProfiles = { ...profile.creatorProfiles };
    let updatedStudioProfiles = { ...profile.studioProfiles };

    // Update creator profiles based on detailed ratings
    if (credits) {
      // Update actor profiles based on acting rating
      credits.cast?.slice(0, 5).forEach((actor: any) => {
        const existing = updatedCreatorProfiles[actor.id] || {
          id: actor.id,
          name: actor.name,
          type: 'actor' as const,
          averageRating: 0,
          totalRatings: 0,
          profilePath: actor.profile_path
        };

        const newTotal = existing.totalRatings + 1;
        const newAverage = (existing.averageRating * existing.totalRatings + detailedRating.acting) / newTotal;

        updatedCreatorProfiles[actor.id] = {
          ...existing,
          averageRating: newAverage,
          totalRatings: newTotal
        };
      });

      // Update director profiles based on direction rating
      const directors = credits.crew?.filter((member: any) => member.job === 'Director') || [];
      directors.forEach((director: any) => {
        const existing = updatedCreatorProfiles[director.id] || {
          id: director.id,
          name: director.name,
          type: 'director' as const,
          averageRating: 0,
          totalRatings: 0,
          profilePath: director.profile_path,
          job: director.job
        };

        const newTotal = existing.totalRatings + 1;
        const newAverage = (existing.averageRating * existing.totalRatings + detailedRating.direction) / newTotal;

        updatedCreatorProfiles[director.id] = {
          ...existing,
          averageRating: newAverage,
          totalRatings: newTotal
        };
      });

      // Update writer profiles based on screenplay rating
      const writers = credits.crew?.filter((member: any) => 
        member.job === 'Writer' || member.job === 'Screenplay' || member.job === 'Story'
      ) || [];
      writers.forEach((writer: any) => {
        const existing = updatedCreatorProfiles[writer.id] || {
          id: writer.id,
          name: writer.name,
          type: 'writer' as const,
          averageRating: 0,
          totalRatings: 0,
          profilePath: writer.profile_path,
          job: writer.job
        };

        const newTotal = existing.totalRatings + 1;
        const newAverage = (existing.averageRating * existing.totalRatings + detailedRating.screenplay) / newTotal;

        updatedCreatorProfiles[writer.id] = {
          ...existing,
          averageRating: newAverage,
          totalRatings: newTotal
        };
      });
    }

    // Update studio profiles based on overall rating
    if (studios) {
      studios.forEach((studio: any) => {
        const existing = updatedStudioProfiles[studio.id] || {
          id: studio.id,
          name: studio.name,
          averageRating: 0,
          totalRatings: 0,
          logoPath: studio.logo_path ? `https://image.tmdb.org/t/p/w92${studio.logo_path}` : undefined
        };

        const newTotal = existing.totalRatings + 1;
        const newAverage = (existing.averageRating * existing.totalRatings + detailedRating.overall) / newTotal;

        updatedStudioProfiles[studio.id] = {
          ...existing,
          averageRating: newAverage,
          totalRatings: newTotal
        };
      });
    }

    const updatedProfile: UserProfile = {
      ...profile,
      ratings: updatedRatings,
      detailedRatings: updatedDetailedRatings,
      creatorProfiles: updatedCreatorProfiles,
      studioProfiles: updatedStudioProfiles
    };

    saveProfile(updatedProfile);
  };

  const toggleFollowCreator = (creatorId: number) => {
    const isFollowing = profile.followedCreators.includes(creatorId);
    const updatedFollowed = isFollowing
      ? profile.followedCreators.filter(id => id !== creatorId)
      : [...profile.followedCreators, creatorId];

    const updatedProfile: UserProfile = {
      ...profile,
      followedCreators: updatedFollowed
    };

    saveProfile(updatedProfile);
  };

  const toggleFollowStudio = (studioId: number) => {
    const isFollowing = profile.followedStudios.includes(studioId);
    const updatedFollowed = isFollowing
      ? profile.followedStudios.filter(id => id !== studioId)
      : [...profile.followedStudios, studioId];

    const updatedProfile: UserProfile = {
      ...profile,
      followedStudios: updatedFollowed
    };

    saveProfile(updatedProfile);
  };

  const setMood = (mood: Mood) => {
    const updatedProfile: UserProfile = {
      ...profile,
      currentMood: mood
    };
    saveProfile(updatedProfile);
  };

  const getTopGenres = (limit: number = 5) => {
    return Object.entries(profile.genrePreferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([genreId, score]) => ({
        genreId: parseInt(genreId),
        score
      }))
      .filter(item => item.score > 5);
  };

  const getTopCreators = (type?: 'actor' | 'director' | 'writer', limit: number = 10) => {
    const creators = Object.values(profile.creatorProfiles)
      .filter(creator => !type || creator.type === type)
      .filter(creator => creator.totalRatings > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);

    return creators;
  };

  const getTopStudios = (limit: number = 10) => {
    return Object.values(profile.studioProfiles)
      .filter(studio => studio.totalRatings > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  };

  const getRatingCount = () => profile.ratings.length;
  const getDetailedRatingCount = () => profile.detailedRatings.length;
  
  const getAverageRating = () => {
    if (profile.ratings.length === 0) return 0;
    return profile.ratings.reduce((sum, rating) => sum + rating.rating, 0) / profile.ratings.length;
  };

  const getDetailedRating = (contentId: number) => {
    return profile.detailedRatings.find(r => r.contentId === contentId);
  };

  const getGenrePreference = (genreId: number) => {
    return profile.genrePreferences[genreId] || 5;
  };

  const hasRated = (contentId: number) => {
    return profile.ratings.some(r => r.contentId === contentId);
  };

  const hasDetailedRating = (contentId: number) => {
    return profile.detailedRatings.some(r => r.contentId === contentId);
  };

  const getUserRating = (contentId: number) => {
    return profile.ratings.find(r => r.contentId === contentId);
  };

  const isFollowingCreator = (creatorId: number) => {
    return profile.followedCreators.includes(creatorId);
  };

  const isFollowingStudio = (studioId: number) => {
    return profile.followedStudios.includes(studioId);
  };

  const resetProfile = () => {
    saveProfile(defaultProfile);
  };

  // Enhanced export functionality
  const exportUserData = () => {
    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      userData: {
        profile: profile,
        statistics: {
          totalRatings: profile.ratings.length,
          totalDetailedRatings: profile.detailedRatings.length,
          averageRating: getAverageRating(),
          topGenres: getTopGenres(10),
          topCreators: {
            actors: getTopCreators('actor', 10),
            directors: getTopCreators('director', 10),
            writers: getTopCreators('writer', 10)
          },
          topStudios: getTopStudios(10)
        }
      },
      metadata: {
        totalRatings: profile.ratings.length,
        totalDetailedRatings: profile.detailedRatings.length,
        followedCreators: profile.followedCreators.length,
        followedStudios: profile.followedStudios.length,
        genrePreferences: Object.keys(profile.genrePreferences).length,
        dataIntegrity: true,
        aiTrainingReady: profile.ratings.length >= 3
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `cinematch-profile-${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Enhanced import functionality
  const importUserData = (importData: any): Promise<{ success: boolean; message: string; details?: any }> => {
    return new Promise((resolve) => {
      try {
        // Validate import data structure
        if (!importData.userData || !importData.userData.profile) {
          resolve({
            success: false,
            message: 'Invalid data format. Missing user profile information.'
          });
          return;
        }

        const importedProfile = importData.userData.profile;

        // Merge with existing data intelligently
        const mergedProfile: UserProfile = {
          ...profile,
          ratings: mergeRatings(profile.ratings, importedProfile.ratings || []),
          detailedRatings: mergeDetailedRatings(profile.detailedRatings, importedProfile.detailedRatings || []),
          genrePreferences: mergeGenrePreferences(profile.genrePreferences, importedProfile.genrePreferences || {}),
          creatorProfiles: mergeCreatorProfiles(profile.creatorProfiles, importedProfile.creatorProfiles || {}),
          studioProfiles: mergeStudioProfiles(profile.studioProfiles, importedProfile.studioProfiles || {}),
          followedCreators: mergeArrays(profile.followedCreators, importedProfile.followedCreators || []),
          followedStudios: mergeArrays(profile.followedStudios, importedProfile.followedStudios || []),
          watchlist: mergeArrays(profile.watchlist, importedProfile.watchlist || []),
          lastUpdated: Date.now()
        };

        saveProfile(mergedProfile);

        resolve({
          success: true,
          message: 'Profile data imported successfully!',
          details: {
            importedRatings: importedProfile.ratings?.length || 0,
            importedDetailedRatings: importedProfile.detailedRatings?.length || 0,
            importedCreators: Object.keys(importedProfile.creatorProfiles || {}).length,
            importedStudios: Object.keys(importedProfile.studioProfiles || {}).length
          }
        });
      } catch (error) {
        console.error('Import error:', error);
        resolve({
          success: false,
          message: 'Failed to import data. Please check the file format.'
        });
      }
    });
  };

  // Helper functions for merging data
  const mergeRatings = (existing: UserRating[], imported: UserRating[]): UserRating[] => {
    const merged = [...existing];
    imported.forEach(importedRating => {
      const existingIndex = merged.findIndex(r => r.contentId === importedRating.contentId);
      if (existingIndex >= 0) {
        // Keep the newer rating
        if (importedRating.timestamp > merged[existingIndex].timestamp) {
          merged[existingIndex] = importedRating;
        }
      } else {
        merged.push(importedRating);
      }
    });
    return merged;
  };

  const mergeDetailedRatings = (existing: DetailedRating[], imported: DetailedRating[]): DetailedRating[] => {
    const merged = [...existing];
    imported.forEach(importedRating => {
      const existingIndex = merged.findIndex(r => r.contentId === importedRating.contentId);
      if (existingIndex >= 0) {
        if (importedRating.timestamp > merged[existingIndex].timestamp) {
          merged[existingIndex] = importedRating;
        }
      } else {
        merged.push(importedRating);
      }
    });
    return merged;
  };

  const mergeGenrePreferences = (existing: { [genreId: number]: number }, imported: { [genreId: number]: number }) => {
    const merged = { ...existing };
    Object.keys(imported).forEach(genreId => {
      const existingPref = merged[parseInt(genreId)] || 5;
      const importedPref = imported[parseInt(genreId)];
      // Average the preferences for better merging
      merged[parseInt(genreId)] = (existingPref + importedPref) / 2;
    });
    return merged;
  };

  const mergeCreatorProfiles = (existing: { [creatorId: number]: CreatorProfile }, imported: { [creatorId: number]: CreatorProfile }) => {
    const merged = { ...existing };
    Object.keys(imported).forEach(creatorId => {
      const existingProfile = merged[parseInt(creatorId)];
      const importedProfile = imported[parseInt(creatorId)];
      
      if (existingProfile) {
        // Merge ratings
        const totalRatings = existingProfile.totalRatings + importedProfile.totalRatings;
        const combinedAverage = 
          (existingProfile.averageRating * existingProfile.totalRatings + 
           importedProfile.averageRating * importedProfile.totalRatings) / totalRatings;
        
        merged[parseInt(creatorId)] = {
          ...existingProfile,
          averageRating: combinedAverage,
          totalRatings: totalRatings
        };
      } else {
        merged[parseInt(creatorId)] = importedProfile;
      }
    });
    return merged;
  };

  const mergeStudioProfiles = (existing: { [studioId: number]: StudioProfile }, imported: { [studioId: number]: StudioProfile }) => {
    const merged = { ...existing };
    Object.keys(imported).forEach(studioId => {
      const existingProfile = merged[parseInt(studioId)];
      const importedProfile = imported[parseInt(studioId)];
      
      if (existingProfile) {
        const totalRatings = existingProfile.totalRatings + importedProfile.totalRatings;
        const combinedAverage = 
          (existingProfile.averageRating * existingProfile.totalRatings + 
           importedProfile.averageRating * importedProfile.totalRatings) / totalRatings;
        
        merged[parseInt(studioId)] = {
          ...existingProfile,
          averageRating: combinedAverage,
          totalRatings: totalRatings
        };
      } else {
        merged[parseInt(studioId)] = importedProfile;
      }
    });
    return merged;
  };

  const mergeArrays = (existing: number[], imported: number[]): number[] => {
    const merged = [...existing];
    imported.forEach(item => {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    });
    return merged;
  };

  return {
    profile,
    addRating,
    addDetailedRating,
    toggleFollowCreator,
    toggleFollowStudio,
    setMood,
    getTopGenres,
    getTopCreators,
    getTopStudios,
    getRatingCount,
    getDetailedRatingCount,
    getAverageRating,
    getDetailedRating,
    getGenrePreference,
    hasRated,
    hasDetailedRating,
    getUserRating,
    isFollowingCreator,
    isFollowingStudio,
    resetProfile,
    saveProfile,
    exportUserData,
    importUserData
  };
};