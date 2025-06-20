import React from 'react';
import { Play, Youtube, Film, Tv } from 'lucide-react';
import { TrailerGrid } from './TrailerGrid';
import { useContent } from '../hooks/useContent';
import { useUserProfile } from '../hooks/useUserProfile';

export const TrailerSection: React.FC = () => {
  const { trendingMovies, trendingTVShows, loading } = useContent();
  const { addRating, getUserRating } = useUserProfile();

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number) => {
    // Get genre IDs for the content (you might need to fetch this)
    const genreIds: number[] = []; // This would come from the content data
    addRating(contentId, contentType, rating, genreIds);
  };

  const getUserRatingValue = (contentId: number): number => {
    const rating = getUserRating(contentId);
    return rating ? rating.rating : 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600/20 to-pink-600/20 px-6 py-3 rounded-full border border-red-500/30">
            <div className="w-6 h-6 bg-red-400/20 rounded animate-pulse" />
            <div className="w-24 h-4 bg-red-400/20 rounded animate-pulse" />
          </div>
          <div className="w-64 h-8 bg-gray-700 rounded mx-auto animate-pulse" />
          <div className="w-96 h-4 bg-gray-700 rounded mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600/20 to-pink-600/20 px-6 py-3 rounded-full border border-red-500/30">
          <Youtube className="w-6 h-6 text-red-400" />
          <span className="text-red-400 font-semibold">Fragman Merkezi</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          En Yeni Fragmanları İzleyin
        </h2>
        
        <p className="text-gray-400 max-w-2xl mx-auto">
          Trend olan film ve dizilerin resmi fragmanlarını HD kalitede izleyin. 
          Beğendiklerinizi puanlayarak kişisel önerilerinizi geliştirin.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 text-center">
          <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Film className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-white">{trendingMovies.length}</div>
          <div className="text-sm text-gray-400">Film Fragmanı</div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 text-center">
          <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Tv className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{trendingTVShows.length}</div>
          <div className="text-sm text-gray-400">Dizi Fragmanı</div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 text-center">
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Play className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">HD</div>
          <div className="text-sm text-gray-400">Kalite Garantisi</div>
        </div>
      </div>

      {/* Trending Movie Trailers */}
      <TrailerGrid
        content={trendingMovies}
        title="Trend Film Fragmanları"
        onRate={handleRate}
        getUserRating={getUserRatingValue}
        maxItems={8}
      />

      {/* Trending TV Show Trailers */}
      <TrailerGrid
        content={trendingTVShows}
        title="Trend Dizi Fragmanları"
        onRate={handleRate}
        getUserRating={getUserRatingValue}
        maxItems={8}
      />

      {/* Features */}
      <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 rounded-xl p-8 border border-red-500/20">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">Fragman İzleme Özellikleri</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center mx-auto">
              <Play className="w-6 h-6 text-red-400" />
            </div>
            <h4 className="font-semibold text-white">HD Kalite</h4>
            <p className="text-sm text-gray-400">Tüm fragmanlar yüksek çözünürlükte</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto">
              <Youtube className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="font-semibold text-white">YouTube Entegrasyonu</h4>
            <p className="text-sm text-gray-400">Resmi YouTube fragmanları</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto">
              <Film className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-semibold text-white">Tam Ekran</h4>
            <p className="text-sm text-gray-400">Sinema deneyimi için tam ekran</p>
          </div>

          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mx-auto">
              <Play className="w-6 h-6 text-green-400" />
            </div>
            <h4 className="font-semibold text-white">Anında Puanlama</h4>
            <p className="text-sm text-gray-400">Fragman izlerken puanlayın</p>
          </div>
        </div>
      </div>
    </div>
  );
};