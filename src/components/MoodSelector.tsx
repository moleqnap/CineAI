import React from 'react';
import { useContent } from '../hooks/useContent';
import { Mood } from '../types';

interface MoodSelectorProps {
  selectedMood?: string;
  onMoodSelect: (mood: Mood) => void;
}

const moods = [
  { id: 'happy', name: 'Happy', emoji: '😄', color: 'from-yellow-400 to-orange-500' },
  { id: 'sad', name: 'Sad', emoji: '😢', color: 'from-blue-400 to-indigo-600' },
  { id: 'excited', name: 'Excited', emoji: '🤩', color: 'from-pink-400 to-red-500' },
  { id: 'relaxed', name: 'Relaxed', emoji: '😌', color: 'from-green-400 to-teal-500' },
  { id: 'adventurous', name: 'Adventurous', emoji: '🏔️', color: 'from-purple-400 to-indigo-600' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', color: 'from-pink-400 to-rose-500' },
  { id: 'thoughtful', name: 'Thoughtful', emoji: '🤔', color: 'from-gray-400 to-slate-600' }
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const { getContentByMood } = useContent();
  const [moodContent, setMoodContent] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleMoodSelect = async (mood: Mood) => {
    onMoodSelect(mood);
    setLoading(true);
    try {
      const content = await getContentByMood(mood);
      setMoodContent(content.slice(0, 6)); // Show first 6 items
    } catch (error) {
      console.error('Error loading mood content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">How are you feeling?</h2>
        <p className="text-gray-400">We'll recommend content based on your mood</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id as Mood)}
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
              selectedMood === mood.id
                ? 'border-blue-500 bg-blue-500/20 scale-105'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:scale-105'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 rounded-2xl transition-opacity duration-300 ${
              selectedMood === mood.id ? 'opacity-20' : 'group-hover:opacity-10'
            }`} />
            
            <div className="relative text-center space-y-3">
              <div className="text-4xl">{mood.emoji}</div>
              <div className="font-semibold text-white">{mood.name}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Mood-based content preview */}
      {selectedMood && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white text-center">
            Perfect for your {selectedMood} mood
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-400">Finding perfect matches...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {moodContent.map((content) => (
                <div key={content.id} className="group relative aspect-[2/3] rounded-lg overflow-hidden">
                  <img 
                    src={content.poster_path} 
                    alt={'title' in content ? content.title : content.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {'title' in content ? content.title : content.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};