import React, { useState } from 'react';
import { Star, Calendar, Play, Users, Award, TrendingUp, Target, Youtube, X } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { StarRating } from './StarRating';
import { DetailedRatingModal } from './DetailedRatingModal';
import { TrailerButton } from './TrailerButton';
import { useRecommendationSystem } from '../hooks/useRecommendationSystem';

interface EnhancedMovieCardProps {
  content: Movie | TVShow;
  onRate?: (rating: number) => void;
  onDetailedRate?: (detailedRating: any, credits?: any, studios?: any[]) => void;
  userRating?: number;
  showRating?: boolean;
  showDetailedRating?: boolean;
  matchScore?: number;
  explanation?: string;
  trailerKey?: string;
  reasons?: string[];
}

export const EnhancedMovieCard: React.FC<EnhancedMovieCardProps> = ({ 
  content, 
  onRate, 
  onDetailedRate,
  userRating,
  showRating = true,
  showDetailedRating = true,
  matchScore,
  explanation,
  trailerKey,
  reasons = []
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetailedModal, setShowDetailedModal] = useState(false);

  const { getUserRating } = useRecommendationSystem();
  const currentRating = getUserRating(content.id);

  const title = 'title' in content ? content.title : content.name;
  const releaseDate = 'release_date' in content ? content.release_date : content.first_air_date;

  const handleStarRating = (newRating: number) => {
    if (onRate) {
      onRate(newRating);
    }
  };

  const handleDetailedRate = () => {
    setShowDetailedModal(true);
  };

  const handleDetailedRatingSubmit = (detailedRating: any, credits?: any, studios?: any[]) => {
    if (onDetailedRate) {
      onDetailedRate(detailedRating, credits, studios);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-blue-500 to-cyan-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const getMatchScoreText = (score: number) => {
    if (score >= 85) return 'Mükemmel Eşleşme';
    if (score >= 70) return 'Çok İyi Eşleşme';
    if (score >= 60) return 'İyi Eşleşme';
    return 'Orta Eşleşme';
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

          {/* Match Score Badge */}
          {matchScore && matchScore >= 60 && (
            <div className="absolute top-16 left-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600">
              %{matchScore} Eşleşme
            </div>
          )}

          {/* User Rating Badge */}
          {currentRating > 0 && (
            <div className="absolute top-4 right-16 flex items-center space-x-1 bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-white fill-white" />
              <span className="text-sm font-medium text-white">{currentRating}</span>
            </div>
          )}

          {/* Match Score Details */}
          {matchScore && isHovered && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-purple-400">Eşleşme Detayı</span>
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getMatchScoreColor(matchScore)} text-white font-bold`}>
                  {getMatchScoreText(matchScore)}
                </span>
              </div>
              
              {reasons.length > 0 && (
                <div className="space-y-1">
                  {reasons.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="text-xs text-gray-300 flex items-center space-x-1">
                      <Target className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              )}
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

          {/* Explanation */}
          {explanation && (
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Target className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300 leading-relaxed">{explanation}</p>
              </div>
            </div>
          )}

          {/* Star Rating Section */}
          {showRating && (
            <div className="pt-4 border-t border-gray-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Bu içeriği puanlayın:</span>
                {currentRating > 0 && (
                  <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    Puanlandı
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
                <span>Detaylı Puanlama</span>
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