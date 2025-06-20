import React, { useState } from 'react';
import { Users, Star, Eye, Calendar, Film, Tv, Building, User, Camera, Pen } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { CreatorFollowModal } from './CreatorFollowModal';

export const FollowingTab: React.FC = () => {
  const { 
    profile, 
    getTopCreators, 
    getTopStudios, 
    isFollowingCreator,
    isFollowingStudio,
    toggleFollowCreator,
    toggleFollowStudio
  } = useUserProfile();
  
  const [showFollowModal, setShowFollowModal] = useState(false);

  const followedCreators = getTopCreators().filter(creator => isFollowingCreator(creator.id));
  const followedStudios = getTopStudios().filter(studio => isFollowingStudio(studio.id));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'actor': return User;
      case 'director': return Camera;
      case 'writer': return Pen;
      default: return User;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'actor': return 'from-blue-400 to-blue-600';
      case 'director': return 'from-purple-400 to-purple-600';
      case 'writer': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (followedCreators.length === 0 && followedStudios.length === 0) {
    return (
      <>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16 space-y-6">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-10 h-10 text-gray-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Start Following Creators</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Follow your favorite actors, directors, writers, and studios to get personalized recommendations and updates about their new releases.
              </p>
            </div>
            <button
              onClick={() => setShowFollowModal(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Discover Creators to Follow
            </button>
          </div>
        </div>

        <CreatorFollowModal
          isOpen={showFollowModal}
          onClose={() => setShowFollowModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Following</h2>
            <p className="text-gray-400 mt-1">
              {followedCreators.length} creators • {followedStudios.length} studios
            </p>
          </div>
          <button
            onClick={() => setShowFollowModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <Users className="w-5 h-5" />
            <span>Manage Following</span>
          </button>
        </div>

        {/* Followed Creators */}
        {followedCreators.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span>Followed Creators</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followedCreators.map((creator) => {
                const Icon = getTypeIcon(creator.type);
                return (
                  <div key={creator.id} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gray-800 rounded-full overflow-hidden">
                          {creator.profilePath ? (
                            <img 
                              src={creator.profilePath} 
                              alt={creator.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${getTypeColor(creator.type)} rounded-full flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white text-lg truncate">{creator.name}</h4>
                        <p className="text-gray-400 text-sm capitalize mb-2">{creator.type}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-medium">{creator.averageRating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400">{creator.totalRatings} ratings</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollowCreator(creator.id)}
                      className="w-full mt-4 py-2 px-4 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Following</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Followed Studios */}
        {followedStudios.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
              <Building className="w-6 h-6 text-green-400" />
              <span>Followed Studios</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followedStudios.map((studio) => (
                <div key={studio.id} className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                      {studio.logoPath ? (
                        <img 
                          src={studio.logoPath} 
                          alt={studio.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <Building className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-lg truncate">{studio.name}</h4>
                      <p className="text-gray-400 text-sm mb-2">Production Studio</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-medium">{studio.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">{studio.totalRatings} ratings</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollowStudio(studio.id)}
                    className="w-full mt-4 py-2 px-4 bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Following</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Placeholder */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span>Recent Activity</span>
          </h3>
          <div className="text-center py-8 text-gray-400">
            <Film className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>Activity feed coming soon!</p>
            <p className="text-sm mt-1">Get notified when your followed creators release new content.</p>
          </div>
        </div>
      </div>

      <CreatorFollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
      />
    </>
  );
};