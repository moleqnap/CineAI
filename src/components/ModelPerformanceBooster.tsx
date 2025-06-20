import React, { useState } from 'react';
import { X, TrendingUp, Brain, Star, Target, Zap, BookOpen, CheckCircle } from 'lucide-react';
import { ContentItem } from '../types';
import { MovieCard } from './MovieCard';

interface ModelPerformanceBoosterProps {
  isOpen: boolean;
  onClose: () => void;
  unratedContent: ContentItem[];
  onRate: (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => void;
  onDetailedRate: (detailedRating: any, credits?: any, studios?: any[]) => void;
}

export const ModelPerformanceBooster: React.FC<ModelPerformanceBoosterProps> = ({
  isOpen,
  onClose,
  unratedContent,
  onRate,
  onDetailedRate
}) => {
  const [ratedInSession, setRatedInSession] = useState<Set<number>>(new Set());
  const [currentBatch, setCurrentBatch] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const batchSize = 8;
  const totalBatches = Math.ceil(unratedContent.length / batchSize);
  const currentContent = unratedContent.slice(currentBatch * batchSize, (currentBatch + 1) * batchSize);

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    onRate(contentId, contentType, rating, genreIds);
    setRatedInSession(prev => new Set([...prev, contentId]));
    
    // Show success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
  };

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    onDetailedRate(detailedRating, credits, studios);
    setRatedInSession(prev => new Set([...prev, detailedRating.contentId]));
    
    // Show success animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
  };

  const nextBatch = () => {
    if (currentBatch < totalBatches - 1) {
      setCurrentBatch(prev => prev + 1);
    }
  };

  const prevBatch = () => {
    if (currentBatch > 0) {
      setCurrentBatch(prev => prev - 1);
    }
  };

  const progressPercentage = ((currentBatch + 1) / totalBatches) * 100;
  const sessionRatings = ratedInSession.size;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Model Performance Booster</h2>
              <p className="text-gray-400 mt-1">Rate content to improve AI recommendation accuracy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Session Progress */}
            <div className="text-right">
              <div className="text-sm text-gray-400">Session Progress</div>
              <div className="text-lg font-bold text-green-400">{sessionRatings} ratings</div>
            </div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-green-600 rounded-full p-4 animate-ping">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Batch {currentBatch + 1} of {totalBatches}</span>
            <span className="text-sm text-gray-400">{progressPercentage.toFixed(0)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="font-semibold text-white">AI Learning</h3>
                <p className="text-sm text-blue-300">Each rating improves prediction accuracy</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-600/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Target className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="font-semibold text-white">Better Matches</h3>
                <p className="text-sm text-purple-300">More data = more personalized recommendations</p>
              </div>
            </div>
          </div>

          <div className="bg-green-600/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-8 h-8 text-green-400" />
              <div>
                <h3 className="font-semibold text-white">Quick Impact</h3>
                <p className="text-sm text-green-300">See improvements immediately</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-green-400" />
              <span>Rate These Popular Items</span>
            </h3>
            <div className="text-sm text-gray-400">
              {currentContent.length} items in this batch
            </div>
          </div>

          {currentContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentContent.map((content) => (
                <div key={content.id} className="relative">
                  <MovieCard
                    content={content}
                    onRate={(rating) => handleRate(
                      content.id, 
                      'title' in content ? 'movie' : 'tv', 
                      rating, 
                      content.genre_ids
                    )}
                    onDetailedRate={handleDetailedRate}
                    showRating={true}
                    showDetailedRating={true}
                  />
                  
                  {/* Rated Indicator */}
                  {ratedInSession.has(content.id) && (
                    <div className="absolute top-4 right-4 bg-green-600 rounded-full p-2">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {/* Performance Boost Indicator */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    +AI Boost
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">All Content Rated!</h3>
              <p className="text-gray-400">You've rated all available content. Great job boosting the AI!</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {totalBatches > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/30">
            <button
              onClick={prevBatch}
              disabled={currentBatch === 0}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Previous Batch
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-400">Batch Navigation</div>
              <div className="text-white font-medium">{currentBatch + 1} / {totalBatches}</div>
            </div>

            <button
              onClick={nextBatch}
              disabled={currentBatch === totalBatches - 1}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800/50 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Next Batch
            </button>
          </div>
        )}

        {/* Footer Stats */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{sessionRatings}</div>
              <div className="text-sm text-gray-400">Ratings This Session</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{unratedContent.length}</div>
              <div className="text-sm text-gray-400">Total Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{Math.round((sessionRatings / Math.max(unratedContent.length, 1)) * 100)}%</div>
              <div className="text-sm text-gray-400">Completion Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">+{sessionRatings * 2}%</div>
              <div className="text-sm text-gray-400">Est. AI Improvement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};