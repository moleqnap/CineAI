import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, User, Film, Pen, Camera, Building } from 'lucide-react';
import { DetailedRating } from '../types';
import { RatingSlider } from './RatingSlider';
import { getMovieDetails, getTVShowDetails } from '../services/tmdbApi';

interface DetailedRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: DetailedRating, credits?: any, studios?: any[]) => void;
  contentId: number;
  contentType: 'movie' | 'tv';
  contentTitle: string;
  existingRating?: DetailedRating;
}

export const DetailedRatingModal: React.FC<DetailedRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contentId,
  contentType,
  contentTitle,
  existingRating
}) => {
  const [overall, setOverall] = useState(existingRating?.overall || 50);
  const [acting, setActing] = useState(existingRating?.acting || 50);
  const [screenplay, setScreenplay] = useState(existingRating?.screenplay || 50);
  const [direction, setDirection] = useState(existingRating?.direction || 50);
  const [review, setReview] = useState(existingRating?.review || '');
  const [contentDetails, setContentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && contentId) {
      loadContentDetails();
    }
  }, [isOpen, contentId, contentType]);

  const loadContentDetails = async () => {
    setLoading(true);
    try {
      const details = contentType === 'movie' 
        ? await getMovieDetails(contentId)
        : await getTVShowDetails(contentId);
      setContentDetails(details);
    } catch (error) {
      console.error('Error loading content details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    const rating: DetailedRating = {
      contentId,
      contentType,
      overall,
      acting,
      screenplay,
      direction,
      timestamp: Date.now(),
      review: review.trim() || undefined
    };

    // Pass credits and production companies for creator/studio profiling
    const credits = contentDetails?.credits;
    const studios = contentDetails?.production_companies;

    onSubmit(rating, credits, studios);
    onClose();
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return 'text-green-400';
    if (rating >= 60) return 'text-yellow-400';
    if (rating >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRatingText = (rating: number) => {
    if (rating >= 90) return 'Masterpiece';
    if (rating >= 80) return 'Excellent';
    if (rating >= 70) return 'Great';
    if (rating >= 60) return 'Good';
    if (rating >= 50) return 'Average';
    if (rating >= 40) return 'Below Average';
    if (rating >= 30) return 'Poor';
    if (rating >= 20) return 'Bad';
    return 'Terrible';
  };

  const getGradientColor = (rating: number) => {
    if (rating >= 80) return 'from-green-500 to-emerald-600';
    if (rating >= 60) return 'from-yellow-500 to-orange-500';
    if (rating >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Detailed Rating</h2>
              <p className="text-gray-400 mt-1">{contentTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex">
          {/* Left Side - Rating Controls */}
          <div className="flex-1 p-6 space-y-8">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getGradientColor(overall)} rounded-lg flex items-center justify-center`}>
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span>Overall Rating</span>
                </h3>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getRatingColor(overall)}`}>
                    {overall}
                  </div>
                  <div className="text-sm text-gray-400">
                    {getRatingText(overall)}
                  </div>
                </div>
              </div>
              <RatingSlider
                rating={overall}
                onRatingChange={setOverall}
                min={0}
                max={100}
                step={1}
                size="lg"
                showText={false}
              />
            </div>

            {/* Acting */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getGradientColor(acting)} rounded-lg flex items-center justify-center`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>Acting Performance</span>
                </h3>
                <div className={`text-xl font-bold ${getRatingColor(acting)}`}>
                  {acting}
                </div>
              </div>
              <RatingSlider
                rating={acting}
                onRatingChange={setActing}
                min={0}
                max={100}
                step={1}
                showText={false}
              />
            </div>

            {/* Screenplay */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getGradientColor(screenplay)} rounded-lg flex items-center justify-center`}>
                    <Pen className="w-4 h-4 text-white" />
                  </div>
                  <span>Screenplay & Story</span>
                </h3>
                <div className={`text-xl font-bold ${getRatingColor(screenplay)}`}>
                  {screenplay}
                </div>
              </div>
              <RatingSlider
                rating={screenplay}
                onRatingChange={setScreenplay}
                min={0}
                max={100}
                step={1}
                showText={false}
              />
            </div>

            {/* Direction */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getGradientColor(direction)} rounded-lg flex items-center justify-center`}>
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <span>Direction & Cinematography</span>
                </h3>
                <div className={`text-xl font-bold ${getRatingColor(direction)}`}>
                  {direction}
                </div>
              </div>
              <RatingSlider
                rating={direction}
                onRatingChange={setDirection}
                min={0}
                max={100}
                step={1}
                showText={false}
              />
            </div>

            {/* Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>Your Review (Optional)</span>
              </h3>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this content..."
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-400">
                {review.length}/500 characters
              </div>
            </div>
          </div>

          {/* Right Side - Content Info & Credits */}
          {contentDetails && (
            <div className="w-80 bg-gray-800/50 border-l border-gray-700 p-6 space-y-6">
              {/* Content Poster */}
              <div className="text-center">
                <img 
                  src={contentDetails.poster_path} 
                  alt={contentTitle}
                  className="w-32 h-48 object-cover rounded-lg mx-auto shadow-lg"
                />
                <div className="mt-3 text-sm text-gray-400">
                  {contentType === 'movie' ? contentDetails.release_date?.split('-')[0] : contentDetails.first_air_date?.split('-')[0]}
                </div>
              </div>

              {/* Key Cast */}
              {contentDetails.credits?.cast && contentDetails.credits.cast.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Key Cast</span>
                  </h4>
                  <div className="space-y-2">
                    {contentDetails.credits.cast.slice(0, 5).map((actor: any) => (
                      <div key={actor.id} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                          {actor.profile_path ? (
                            <img 
                              src={actor.profile_path} 
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{actor.name}</div>
                          <div className="text-xs text-gray-400 truncate">{actor.character}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Directors */}
              {contentDetails.credits?.crew && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-purple-400" />
                    <span>Direction</span>
                  </h4>
                  <div className="space-y-2">
                    {contentDetails.credits.crew
                      .filter((member: any) => member.job === 'Director')
                      .slice(0, 3)
                      .map((director: any) => (
                        <div key={director.id} className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                            {director.profile_path ? (
                              <img 
                                src={director.profile_path} 
                                alt={director.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-white">{director.name}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Production Companies */}
              {contentDetails.production_companies && contentDetails.production_companies.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                    <Building className="w-4 h-4 text-green-400" />
                    <span>Studios</span>
                  </h4>
                  <div className="space-y-2">
                    {contentDetails.production_companies.slice(0, 3).map((company: any) => (
                      <div key={company.id} className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                          {company.logo_path ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${company.logo_path}`} 
                              alt={company.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Building className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="text-sm text-white">{company.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/30">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              Average: <span className="text-white font-medium">{((overall + acting + screenplay + direction) / 4).toFixed(1)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : existingRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};