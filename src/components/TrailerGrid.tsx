import React, { useState, useEffect } from 'react';
import { Play, Film, Tv, Calendar, Star, Eye, TrendingUp, Youtube, ExternalLink } from 'lucide-react';
import { TrailerButton } from './TrailerButton';
import { getContentVideos } from '../services/tmdbApi';
import { ContentItem } from '../types';

interface TrailerGridProps {
  content: ContentItem[];
  title?: string;
  onRate?: (contentId: number, contentType: 'movie' | 'tv', rating: number) => void;
  getUserRating?: (contentId: number) => number;
  maxItems?: number;
}

interface ContentWithTrailer extends ContentItem {
  trailerKey?: string;
  hasTrailer?: boolean;
}

export const TrailerGrid: React.FC<TrailerGridProps> = ({
  content,
  title = "Fragmanlar",
  onRate,
  getUserRating,
  maxItems = 12
}) => {
  const [contentWithTrailers, setContentWithTrailers] = useState<ContentWithTrailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrailers = async () => {
      setLoading(true);
      
      const contentWithTrailerData = await Promise.all(
        content.slice(0, maxItems).map(async (item) => {
          try {
            const videos = await getContentVideos(item.id, 'title' in item ? 'movie' : 'tv');
            const trailer = videos.find(v => v.type === 'Trailer') || videos[0];
            
            return {
              ...item,
              trailerKey: trailer?.key,
              hasTrailer: !!trailer
            };
          } catch (error) {
            return {
              ...item,
              hasTrailer: false
            };
          }
        })
      );

      // Filter to only show content with trailers
      const withTrailers = contentWithTrailerData.filter(item => item.hasTrailer);
      setContentWithTrailers(withTrailers);
      setLoading(false);
    };

    if (content.length > 0) {
      loadTrailers();
    }
  }, [content, maxItems]);

  const openTrailerInYouTube = (trailerKey: string) => {
    window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Play className="w-6 h-6 text-red-500" />
          <span>{title}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contentWithTrailers.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
          <Play className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Fragman Bulunamadı</h3>
          <p className="text-gray-400">Bu içerikler için henüz fragman mevcut değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Play className="w-6 h-6 text-red-500" />
          <span>{title}</span>
        </h2>
        <div className="text-sm text-gray-400">
          {contentWithTrailers.length} fragman mevcut
        </div>
      </div>

      {/* Trailer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contentWithTrailers.map((item) => {
          const title = 'title' in item ? item.title : item.name;
          const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
          const contentType = 'title' in item ? 'movie' : 'tv';
          const userRating = getUserRating ? getUserRating(item.id) : 0;

          return (
            <div
              key={item.id}
              className="group bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:scale-105"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.backdrop_path || item.poster_path}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => item.trailerKey && openTrailerInYouTube(item.trailerKey)}
                    className="w-16 h-16 bg-red-600/90 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm group-hover:scale-125"
                  >
                    <Play className="w-8 h-8 text-white ml-1" />
                  </button>
                </div>

                {/* YouTube Badge */}
                <div className="absolute top-4 right-4 bg-red-600/80 backdrop-blur-sm px-2 py-1 rounded-full flex items-center space-x-1">
                  <Youtube className="w-3 h-3 text-white" />
                  <span className="text-xs text-white font-medium">HD</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium text-white">{item.vote_average.toFixed(1)}</span>
                </div>

                {/* Content Type Badge */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                  {contentType === 'movie' ? (
                    <Film className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Tv className="w-3 h-3 text-purple-400" />
                  )}
                </div>

                {/* User Rating */}
                {userRating > 0 && (
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-white fill-white" />
                    <span className="text-xs font-medium text-white">{userRating}</span>
                  </div>
                )}
              </div>

              {/* Content Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 mb-1">
                    {title}
                  </h3>
                  
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(releaseDate).getFullYear()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {contentType === 'movie' ? (
                        <>
                          <Film className="w-3 h-3" />
                          <span>Film</span>
                        </>
                      ) : (
                        <>
                          <Tv className="w-3 h-3" />
                          <span>Dizi</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overview */}
                {item.overview && (
                  <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                    {item.overview}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => item.trailerKey && openTrailerInYouTube(item.trailerKey)}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>İzle</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Eye className="w-3 h-3" />
                    <span>YouTube</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more button if there are more items */}
      {content.length > maxItems && (
        <div className="text-center pt-6">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2 mx-auto">
            <TrendingUp className="w-4 h-4" />
            <span>Daha Fazla Fragman</span>
          </button>
        </div>
      )}

      {/* YouTube Notice */}
      <div className="bg-red-600/10 border border-red-500/20 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center space-x-2 text-red-400 mb-2">
          <Youtube className="w-5 h-5" />
          <span className="font-semibold">YouTube'da İzle</span>
        </div>
        <p className="text-sm text-gray-300">
          En iyi deneyim için fragmanlar YouTube'da açılır. HD kalite ve tam ekran seçenekleriyle.
        </p>
      </div>
    </div>
  );
};