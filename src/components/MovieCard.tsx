import React, { useState } from 'react';
import { Star, Calendar, Play, Users, Award, TrendingUp, Youtube } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { RatingSlider } from './RatingSlider';
import { DetailedRatingModal } from './DetailedRatingModal';
import { StarRating } from './StarRating';
import { TrailerButton } from './TrailerButton';
import { useRecommendationSystem } from '../hooks/useRecommendationSystem';

interface MovieCardProps {
  content: Movie | TVShow;
  onRate?: (rating: number) => void;
  onDetailedRate?: (detailedRating: any, credits?: any, studios?: any[]) => void;
  userRating?: number;
  showRating?: boolean;
  showDetailedRating?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ 
  content, 
  onRate, 
  onDetailedRate,
  userRating,
  showRating = true,
  showDetailedRating = true
}) => {
  const [rating, setRating] = useState(userRating || 5);
  const [isHovered, setIsHovered] = useState(false);
  const [hasRated, setHasRated] = useState(Boolean(userRating));
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  const { addRating, getUserRating } = useRecommendationSystem();
  const currentRating = getUserRating(content.id);

  const title = 'title' in content ? content.title : content.name;
  const releaseDate = 'release_date' in content ? content.release_date : content.first_air_date;

  const handleStarRating = (newRating: number) => {
    const contentType = 'title' in content ? 'movie' : 'tv';
    addRating(content.id, newRating, contentType);
    setHasRated(true);
    if (onRate) {
      onRate(newRating);
    }
  };

  const handleRate = () => {
    if (onRate) {
      onRate(rating);
      setHasRated(true);
    }
  };

  const handleDetailedRate = () => {
    setShowDetailedModal(true);
  };

  const handleDetailedRatingSubmit = (detailedRating: any, credits?: any, studios?: any[]) => {
    if (onDetailedRate) {
      onDetailedRate(detailedRating, credits, studios);
      setHasRated(true);
    }
  };

  return (
    <>
      <div 
        className="group relative bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 transition-all duration-500 hover:scale-105 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Movie Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img 
            src={content.poster_path} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'}`} />
          
          {/* Trailer Button */}
          <div className={`absolute top-4 right-4 transition-all duration-300 ${isHovered ? 'scale-100 opacity-100' : 'scale-75 opacity-80'}`}>
            <TrailerButton
              contentId={content.id}
              contentType={'title' in content ? 'movie' : 'tv'}
              contentTitle={title}
              size="md"
              variant="primary"
            />
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium text-white">{content.vote_average.toFixed(1)}</span>
          </div>

          {/* User Rating Badge */}
          {currentRating > 0 && (
            <div className="absolute top-16 left-4 flex items-center space-x-1 bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-sm font-medium text-white">{currentRating}</span>
            </div>
          )}

          {/* Cast Preview */}
          {content.credits && content.credits.cast.length > 0 && isHovered && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center space-x-1 text-xs text-white/80 mb-2">
                <Users className="w-3 h-3" />
                <span>Cast</span>
              </div>
              <div className="flex -space-x-2">
                {content.credits.cast.slice(0, 4).map((actor) => (
                  <div key={actor.id} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                    {actor.profile_path ? (
                      <img 
                        src={actor.profile_path} 
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                        <Users className="w-3 h-3 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-white leading-tight mb-2 line-clamp-2">
              {title}
            </h3>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(releaseDate).getFullYear()}</span>
              </div>
              {content.credits && (
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{content.credits.cast.length} cast</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
              {content.overview}
            </p>
          </div>

          {/* Genres */}
          {content.genres && content.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {content.genres.slice(0, 3).map(genre => (
                <span 
                  key={genre.id}
                  className="px-2 py-1 text-xs bg-gray-800/50 text-gray-300 rounded-full border border-gray-700/50"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}

          {/* Star Rating Section */}
          {showRating && (
            <div className="pt-4 border-t border-gray-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Rate this content:</span>
                {currentRating > 0 && (
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    Rated
                  </span>
                )}
              </div>
              
              <StarRating
                rating={currentRating}
                onRatingChange={handleStarRating}
                size="md"
                showValue={true}
              />
            </div>
          )}

          {/* Detailed Rating Button */}
          {showDetailedRating && onDetailedRate && (
            <div className="pt-2">
              <button
                onClick={handleDetailedRate}
                className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:scale-105 active:scale-95"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Detailed Rating</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Rating Modal */}
      {showDetailedModal && onDetailedRate && (
        <DetailedRatingModal
          isOpen={showDetailedModal}
          onClose={() => setShowDetailedModal(false)}
          onSubmit={handleDetailedRatingSubmit}
          contentId={content.id}
          contentType={'title' in content ? 'movie' : 'tv'}
          contentTitle={title}
        />
      )}
    </>
  );
};