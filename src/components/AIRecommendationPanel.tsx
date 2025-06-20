import React, { useState, useEffect } from 'react';
import { Brain, Zap, Users, Star, TrendingUp, RefreshCw, Target, BarChart3, Lightbulb, Sparkles, Database, Download, Upload, Plus, BookOpen } from 'lucide-react';
import { useAIRecommendationEngine } from '../hooks/useAIRecommendationEngine';
import { useUserProfile } from '../hooks/useUserProfile';
import { useContent } from '../hooks/useContent';
import { MovieCard } from './MovieCard';
import { DataExportImportModal } from './DataExportImportModal';
import { ModelPerformanceBooster } from './ModelPerformanceBooster';

export const AIRecommendationPanel: React.FC = () => {
  const {
    recommendations,
    recommendationScores,
    isTraining,
    lastUpdate,
    getAIStats,
    getRecommendationExplanation,
    retrainModel,
    findSimilarUsers,
    hasEnoughData
  } = useAIRecommendationEngine();

  const { addRating, addDetailedRating, profile } = useUserProfile();
  const { trendingMovies, trendingTVShows } = useContent();
  
  const [showExplanations, setShowExplanations] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showPerformanceBooster, setShowPerformanceBooster] = useState(false);

  const stats = getAIStats();
  const similarUsers = findSimilarUsers();

  const handleRate = (contentId: number, contentType: 'movie' | 'tv', rating: number, genreIds: number[]) => {
    addRating(contentId, contentType, rating, genreIds);
  };

  const handleDetailedRate = (detailedRating: any, credits?: any, studios?: any[]) => {
    addDetailedRating(detailedRating, credits, studios);
  };

  // Get unrated content for performance boosting
  const ratedContentIds = new Set([
    ...profile.ratings.map(r => r.contentId),
    ...profile.detailedRatings.map(r => r.contentId)
  ]);

  const unratedContent = [...trendingMovies, ...trendingTVShows]
    .filter(content => !ratedContentIds.has(content.id))
    .slice(0, 20);

  // New user experience
  if (!hasEnoughData) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-3 rounded-full border border-purple-500/30">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-purple-400 font-semibold">AI Learning Mode</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Training Your Personal AI
          </h2>
          
          <p className="text-gray-400 max-w-2xl mx-auto">
            The AI needs at least 3 ratings to start learning your preferences. Rate some content to unlock personalized recommendations.
          </p>
        </div>

        {/* Progress */}
        <div className="max-w-md mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-semibold">Learning Progress</span>
              <span className="text-purple-400 font-bold">{profile.ratings.length + profile.detailedRatings.length}/3</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(((profile.ratings.length + profile.detailedRatings.length) / 3) * 100, 100)}%` }}
              />
            </div>
            
            <p className="text-sm text-gray-400 mt-3 text-center">
              Rate {3 - (profile.ratings.length + profile.detailedRatings.length)} more items to activate AI recommendations
            </p>
          </div>
        </div>

        {/* Quick Rating Section */}
        {unratedContent.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Quick Start - Rate These Popular Items</h3>
              <p className="text-gray-400">Help the AI learn your preferences faster</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {unratedContent.slice(0, 8).map((content) => (
                <MovieCard
                  key={content.id}
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
              ))}
            </div>
          </div>
        )}

        {/* Import Option for New Users */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto">
              <Database className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Already Have an AI Profile?</h3>
            <p className="text-gray-300 text-sm max-w-md mx-auto">
              If you've used CineMatch AI before, you can import your previous profile to instantly restore your personalized recommendations.
            </p>
            <button
              onClick={() => setShowDataModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Import AI Profile</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span>How the AI Works</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">🧠 Neural Learning</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Analyzes your rating patterns</li>
                <li>• Learns genre preferences automatically</li>
                <li>• Finds users with similar tastes</li>
                <li>• Updates in real-time with each rating</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-2">🎯 Hybrid Recommendations</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Content-based filtering (60%)</li>
                <li>• Collaborative filtering (40%)</li>
                <li>• Confidence scoring for each suggestion</li>
                <li>• Personalized explanation for each pick</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-3 rounded-full border border-purple-500/30">
          <Brain className="w-6 h-6 text-purple-400" />
          <span className="text-purple-400 font-semibold">AI Recommendation Engine</span>
          {isTraining && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Training...</span>
            </div>
          )}
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Your Personal AI Curator
        </h2>
        
        <p className="text-gray-400 max-w-2xl mx-auto">
          Advanced machine learning algorithms analyze your preferences to deliver perfectly tailored recommendations.
        </p>
      </div>

      {/* AI Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-sm text-gray-400">Training Users</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.currentUserRatings}</div>
              <div className="text-sm text-gray-400">Your Ratings</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stats.modelAccuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Confidence</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{recommendations.length}</div>
              <div className="text-sm text-gray-400">Recommendations</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Similar Users */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span>Similar Users Found</span>
          </h3>
          
          {similarUsers.length > 0 ? (
            <div className="space-y-3">
              {similarUsers.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">User {user.userId.split('_')[2]}</div>
                      <div className="text-xs text-gray-400">{user.commonRatings} common ratings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-400">{(user.similarity * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">similarity</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-sm">No similar users found yet</p>
            </div>
          )}
        </div>

        {/* Model Performance */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <span>Model Performance</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Prediction Confidence</span>
                <span className="text-sm font-bold text-green-400">{stats.modelAccuracy.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${stats.modelAccuracy}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Data Coverage</span>
                <span className="text-sm font-bold text-blue-400">{Math.min((stats.currentUserRatings / 20) * 100, 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((stats.currentUserRatings / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                Last updated: {stats.lastTrainingDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Controls</h3>
            <p className="text-sm text-gray-400">
              The AI automatically retrains with each new rating. Manual retraining uses the latest data.
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDataModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg font-medium transition-all"
            >
              <Database className="w-4 h-4" />
              <span>Data</span>
            </button>

            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showExplanations 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Explanations</span>
            </button>

            <button
              onClick={() => setShowPerformanceBooster(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Boost Performance</span>
            </button>
            
            <button
              onClick={retrainModel}
              disabled={isTraining}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training...' : 'Retrain Model'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span>AI Curated For You</span>
            </h3>
            <div className="text-sm text-gray-400">
              {recommendations.length} personalized recommendations
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((content, index) => {
              const score = recommendationScores.find(r => r.contentId === content.id);
              const explanations = getRecommendationExplanation(content.id);
              
              return (
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
                  
                  {/* AI Score Badge */}
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    #{index + 1} AI Pick
                  </div>
                  
                  {/* Confidence Score */}
                  {score && (
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-white font-medium">
                          {(score.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* AI Explanations */}
                  {showExplanations && explanations.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Brain className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-purple-400 mb-1">AI Reasoning:</div>
                          <div className="space-y-1">
                            {explanations.map((reason, idx) => (
                              <div key={idx} className="text-xs text-gray-300">
                                • {reason}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && !isTraining && (
        <div className="text-center py-12 space-y-6">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">AI is Learning</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              The AI is analyzing your preferences. Rate more content to improve recommendation quality.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowPerformanceBooster(true)}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Rate Content to Improve AI
            </button>
            <button
              onClick={retrainModel}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            >
              Retrain AI Model
            </button>
          </div>
        </div>
      )}

      {/* Data Management Modal */}
      <DataExportImportModal
        isOpen={showDataModal}
        onClose={() => setShowDataModal(false)}
      />

      {/* Model Performance Booster Modal */}
      <ModelPerformanceBooster
        isOpen={showPerformanceBooster}
        onClose={() => setShowPerformanceBooster(false)}
        unratedContent={unratedContent}
        onRate={handleRate}
        onDetailedRate={handleDetailedRate}
      />
    </div>
  );
};