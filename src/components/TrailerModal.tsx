import React, { useState, useEffect } from 'react';
import { X, Play, ExternalLink, Share2, Star, Youtube, Info } from 'lucide-react';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey: string;
  contentTitle: string;
  contentId: number;
  contentType: 'movie' | 'tv';
  onRate?: (rating: number) => void;
  userRating?: number;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerKey,
  contentTitle,
  contentId,
  contentType,
  onRate,
  userRating = 0
}) => {
  const [showRating, setShowRating] = useState(false);
  const [tempRating, setTempRating] = useState(userRating);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleShare = async () => {
    const shareData = {
      title: `${contentTitle} - Fragman`,
      text: `${contentTitle} fragmanını izle!`,
      url: `https://www.youtube.com/watch?v=${trailerKey}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
    }
  };

  const handleRating = (rating: number) => {
    setTempRating(rating);
    if (onRate) {
      onRate(rating);
    }
    setShowRating(false);
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{contentTitle}</h3>
              <p className="text-gray-400 text-sm">Resmi Fragman</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* YouTube Embedding Notice */}
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto">
              <Youtube className="w-8 h-8 text-red-400" />
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Fragman Hazır!</h4>
              <p className="text-gray-300 text-sm mb-4">
                En iyi deneyim için fragmanı YouTube'da izleyin. HD kalitede ve tam ekran seçenekleriyle.
              </p>
            </div>

            <button
              onClick={openInYouTube}
              className="inline-flex items-center space-x-3 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Youtube className="w-5 h-5" />
              <span>YouTube'da İzle</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Rating button */}
              <button
                onClick={() => setShowRating(!showRating)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Star className={`w-4 h-4 ${tempRating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                <span className="text-white text-sm">Puanla</span>
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-400" />
                <span className="text-white text-sm">Paylaş</span>
              </button>
            </div>

            <div className="text-sm text-gray-400">
              {contentType === 'movie' ? 'Film' : 'Dizi'} Fragmanı
            </div>
          </div>

          {/* Rating Section */}
          {showRating && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Bu içeriği puanlayın</h4>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= tempRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-400 hover:text-yellow-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {tempRating > 0 && (
                <p className="text-sm text-gray-300 mt-2">
                  {tempRating} yıldız verdiniz
                </p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-gray-800/30 rounded-lg p-4 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="mb-2">
                <strong>Neden YouTube'da açılıyor?</strong>
              </p>
              <p>
                YouTube'un güvenlik politikaları nedeniyle fragmanlar doğrudan gömülemiyor. 
                Bu sayede en iyi kalitede ve tam özelliklerle izleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};