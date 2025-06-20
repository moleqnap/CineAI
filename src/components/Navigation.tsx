import React from 'react';
import { Film, TrendingUp, User, Heart, Zap, Users, Star, Brain, Sparkles, Play } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'discover', name: 'Discover', icon: Film },
    { id: 'trailers', name: 'Trailers', icon: Play },
    { id: 'recommendations', name: 'For You', icon: Sparkles },
    { id: 'ai-recommendations', name: 'AI Engine', icon: Brain },
    { id: 'rated', name: 'Rated', icon: Star },
    { id: 'mood', name: 'Mood', icon: Heart },
    { id: 'following', name: 'Following', icon: Users },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CineMatch AI</h1>
              <p className="text-xs text-gray-400">Personalized Discovery Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:block">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};