import React from 'react';
import { Star } from 'lucide-react';

interface RatingSliderProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const RatingSlider: React.FC<RatingSliderProps> = ({ 
  rating, 
  onRatingChange, 
  min = 1,
  max = 10,
  step = 0.1,
  size = 'md',
  showText = true
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const getRatingColor = (rating: number) => {
    const normalizedRating = max === 100 ? rating : rating * 10;
    if (normalizedRating >= 80) return 'from-green-400 to-emerald-500';
    if (normalizedRating >= 60) return 'from-yellow-400 to-orange-500';
    if (normalizedRating >= 40) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-red-600';
  };

  const getRatingText = (rating: number) => {
    const normalizedRating = max === 100 ? rating : rating * 10;
    if (normalizedRating >= 90) return 'Masterpiece';
    if (normalizedRating >= 80) return 'Excellent';
    if (normalizedRating >= 70) return 'Great';
    if (normalizedRating >= 60) return 'Good';
    if (normalizedRating >= 50) return 'Average';
    if (normalizedRating >= 40) return 'Below Average';
    if (normalizedRating >= 30) return 'Poor';
    if (normalizedRating >= 20) return 'Bad';
    return 'Terrible';
  };

  const percentage = ((rating - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      {showText && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-lg font-semibold text-white">
              {max === 100 ? rating : rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-300">{getRatingText(rating)}</span>
        </div>
      )}
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={rating}
          onChange={(e) => onRatingChange(parseFloat(e.target.value))}
          className="w-full appearance-none bg-transparent cursor-pointer"
          style={{
            background: `linear-gradient(to right, transparent 0%, transparent ${percentage}%, rgba(255,255,255,0.2) ${percentage}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <div 
          className={`absolute top-0 left-0 ${sizeClasses[size]} bg-gradient-to-r ${getRatingColor(rating)} rounded-full pointer-events-none transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{Math.floor((min + max) / 2)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};