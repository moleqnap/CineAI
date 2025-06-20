import React, { useState, useEffect } from 'react';
import { X, User, Camera, Pen, Building, Search, Star, Users, Eye, EyeOff } from 'lucide-react';
import { CreatorProfile, StudioProfile } from '../types';
import { useUserProfile } from '../hooks/useUserProfile';

interface CreatorFollowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatorFollowModal: React.FC<CreatorFollowModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    profile, 
    getTopCreators, 
    getTopStudios, 
    toggleFollowCreator, 
    toggleFollowStudio,
    isFollowingCreator,
    isFollowingStudio
  } = useUserProfile();
  
  const [activeTab, setActiveTab] = useState<'actors' | 'directors' | 'writers' | 'studios'>('actors');
  const [searchQuery, setSearchQuery] = useState('');

  const topActors = getTopCreators('actor', 20);
  const topDirectors = getTopCreators('director', 20);
  const topWriters = getTopCreators('writer', 20);
  const topStudios = getTopStudios(20);

  const getFilteredCreators = (creators: CreatorProfile[]) => {
    if (!searchQuery) return creators;
    return creators.filter(creator => 
      creator.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredStudios = (studios: StudioProfile[]) => {
    if (!searchQuery) return studios;
    return studios.filter(studio => 
      studio.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

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

  if (!isOpen) return null;

  const renderCreatorCard = (creator: CreatorProfile) => {
    const Icon = getTypeIcon(creator.type);
    const isFollowing = isFollowingCreator(creator.id);

    return (
      <div key={creator.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden">
              {creator.profilePath ? (
                <img 
                  src={creator.profilePath} 
                  alt={creator.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r ${getTypeColor(creator.type)} rounded-full flex items-center justify-center`}>
              <Icon className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{creator.name}</h4>
            <p className="text-sm text-gray-400 capitalize">{creator.type}</p>
            
            <div className="flex items-center space-x-3 mt-2 text-xs">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white">{creator.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">{creator.totalRatings}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleFollowCreator(creator.id)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              isFollowing
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {isFollowing ? (
              <>
                <Eye className="w-3 h-3" />
                <span>Following</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderStudioCard = (studio: StudioProfile) => {
    const isFollowing = isFollowingStudio(studio.id);

    return (
      <div key={studio.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
            {studio.logoPath ? (
              <img 
                src={studio.logoPath} 
                alt={studio.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Building className="w-6 h-6 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white truncate">{studio.name}</h4>
            <p className="text-sm text-gray-400">Production Studio</p>
            
            <div className="flex items-center space-x-3 mt-2 text-xs">
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-white">{studio.averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">{studio.totalRatings}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleFollowStudio(studio.id)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              isFollowing
                ? 'bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {isFollowing ? (
              <>
                <Eye className="w-3 h-3" />
                <span>Following</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Follow Creators & Studios</h2>
            <p className="text-gray-400 mt-1">Get notified about new releases from your favorite creators</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search creators and studios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'actors', name: 'Actors', icon: User, count: topActors.length },
            { id: 'directors', name: 'Directors', icon: Camera, count: topDirectors.length },
            { id: 'writers', name: 'Writers', icon: Pen, count: topWriters.length },
            { id: 'studios', name: 'Studios', icon: Building, count: topStudios.length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
                <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">{tab.count}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'actors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredCreators(topActors).map(renderCreatorCard)}
              {getFilteredCreators(topActors).length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  {searchQuery ? 'No actors found matching your search.' : 'No actors to follow yet. Rate some content to discover actors!'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'directors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredCreators(topDirectors).map(renderCreatorCard)}
              {getFilteredCreators(topDirectors).length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  {searchQuery ? 'No directors found matching your search.' : 'No directors to follow yet. Rate some content to discover directors!'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'writers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredCreators(topWriters).map(renderCreatorCard)}
              {getFilteredCreators(topWriters).length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  {searchQuery ? 'No writers found matching your search.' : 'No writers to follow yet. Rate some content to discover writers!'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'studios' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredStudios(topStudios).map(renderStudioCard)}
              {getFilteredStudios(topStudios).length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  {searchQuery ? 'No studios found matching your search.' : 'No studios to follow yet. Rate some content to discover studios!'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/30">
          <div className="text-sm text-gray-400">
            Following: {profile.followedCreators.length} creators, {profile.followedStudios.length} studios
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};