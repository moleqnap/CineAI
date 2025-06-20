import React from 'react';
import { Star, Users, Eye, EyeOff } from 'lucide-react';
import { CreatorProfile } from '../types';

interface CreatorCardProps {
  creator: CreatorProfile;
  isFollowed: boolean;
  onToggleFollow: (creatorId: number) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  isFollowed,
  onToggleFollow
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'director': return 'from-purple-400 to-purple-600';
      case 'actor': return 'from-blue-400 to-blue-600';
      case 'writer': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'director': return '🎬';
      case 'actor': return '🎭';
      case 'writer': return '✍️';
      default: return '🎨';
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 bg-gray-800 rounded-full overflow-hidden">
            {creator.profilePath ? (
              <img 
                src={creator.profilePath} 
                alt={creator.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                {getTypeIcon(creator.type)}
              </div>
            )}
          </div>
          
          {/* Type Badge */}
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${getTypeColor(creator.type)} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
            {creator.type[0].toUpperCase()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg truncate">{creator.name}</h3>
          <p className="text-gray-400 text-sm capitalize mb-2">{creator.type}</p>
          
          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white font-medium">{creator.averageRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">{creator.totalRatings} ratings</span>
            </div>
          </div>
        </div>

        {/* Follow Button */}
        <button
          onClick={() => onToggleFollow(creator.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            isFollowed
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
              : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white'
          }`}
        >
          {isFollowed ? (
            <>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:block">Following</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="hidden sm:block">Follow</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};