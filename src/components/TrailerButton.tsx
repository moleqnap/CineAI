import React, { useState } from 'react';
import { Play, Youtube, Loader, X, ExternalLink } from 'lucide-react';
import { getContentVideos } from '../services/tmdbApi';

interface TrailerButtonProps {
  contentId: number;
  contentType: 'movie' | 'tv';
  contentTitle: string;
  onRate?: (rating: number) => void;
  userRating?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'minimal';
}

export const TrailerButton: React.FC<TrailerButtonProps> = ({
  contentId,
  contentType,
  contentTitle,
  onRate,
  userRating,
  className = '',
  size = 'md',
  variant = 'primary'
}) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const variantClasses = {
    primary: 'bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm',
    minimal: 'bg-black/50 hover:bg-black/70 text-white'
  };

  const loadTrailer = async () => {
    if (trailerKey) {
      // YouTube'da direkt aç
      window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const videos = await getContentVideos(contentId, contentType);
      const trailer = videos.find(v => v.type === 'Trailer') || videos[0];
      
      if (trailer) {
        setTrailerKey(trailer.key);
        // YouTube'da direkt aç
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
      } else {
        setError('Fragman bulunamadı');
      }
    } catch (err) {
      console.error('Error loading trailer:', err);
      setError('Fragman yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    loadTrailer();
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]}
          rounded-full flex items-center justify-center 
          transition-all duration-300 hover:scale-110 
          disabled:opacity-50 disabled:cursor-not-allowed
          relative group
          ${className}
        `}
        title={error || "Fragmanı YouTube'da izle"}
      >
        {loading ? (
          <Loader className={`${iconSizes[size]} animate-spin`} />
        ) : error ? (
          <Youtube className={`${iconSizes[size]} text-red-400`} />
        ) : (
          <Play className={`${iconSizes[size]} ml-0.5`} />
        )}
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          YouTube'da İzle
        </div>
      </button>

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </>
  );
};