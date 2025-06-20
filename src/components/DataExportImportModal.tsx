import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, Database, AlertCircle, CheckCircle2, X, Zap, Brain, Star, Users } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useRecommendationSystem } from '../hooks/useRecommendationSystem';

interface DataExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExportData {
  version: string;
  exportDate: string;
  userData: {
    profile: any;
    recommendations: any;
    statistics: any;
  };
  metadata: {
    totalRatings: number;
    totalDetailedRatings: number;
    followedCreators: number;
    followedStudios: number;
    genrePreferences: number;
    aiTrainingData: boolean;
  };
}

interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    importedRatings: number;
    importedDetailedRatings: number;
    importedCreators: number;
    importedStudios: number;
    updatedGenres: number;
  };
}

export const DataExportImportModal: React.FC<DataExportImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { profile, saveProfile } = useUserProfile();
  const { getRecommendationStats, exportRatings } = useRecommendationSystem();
  
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate comprehensive export data
  const generateExportData = (): ExportData => {
    const stats = getRecommendationStats();
    
    return {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      userData: {
        profile: profile,
        recommendations: {
          stats: stats,
          preferences: profile.genrePreferences,
          creatorProfiles: profile.creatorProfiles,
          studioProfiles: profile.studioProfiles
        },
        statistics: {
          totalRatings: profile.ratings.length,
          totalDetailedRatings: profile.detailedRatings.length,
          averageRating: profile.ratings.length > 0 
            ? profile.ratings.reduce((sum, r) => sum + r.rating, 0) / profile.ratings.length 
            : 0,
          mostRatedGenres: Object.entries(profile.genrePreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5),
          topCreators: Object.values(profile.creatorProfiles)
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 10),
          exportMetrics: {
            dataIntegrity: true,
            completeness: 100,
            compatibility: "v1.0.0"
          }
        }
      },
      metadata: {
        totalRatings: profile.ratings.length,
        totalDetailedRatings: profile.detailedRatings.length,
        followedCreators: profile.followedCreators.length,
        followedStudios: profile.followedStudios.length,
        genrePreferences: Object.keys(profile.genrePreferences).length,
        aiTrainingData: profile.ratings.length >= 3
      }
    };
  };

  // Export data as JSON file
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const exportData = generateExportData();
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `cinematch-ai-profile-${timestamp}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Validate import data
  const validateImportData = (data: any): { valid: boolean; error?: string } => {
    if (!data.version || !data.userData || !data.metadata) {
      return { valid: false, error: 'Invalid file format. Missing required fields.' };
    }

    if (!data.userData.profile) {
      return { valid: false, error: 'No profile data found in file.' };
    }

    if (data.version !== "1.0.0") {
      return { valid: false, error: `Unsupported version: ${data.version}. Expected: 1.0.0` };
    }

    return { valid: true };
  };

  // Import data from JSON file
  const handleImport = async (importData: ExportData) => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const validation = validateImportData(importData);
      if (!validation.valid) {
        setImportResult({
          success: false,
          message: validation.error || 'Invalid file format'
        });
        return;
      }

      const importedProfile = importData.userData.profile;
      
      // Merge with existing data (keeping newer timestamps)
      const mergedProfile = {
        ...profile,
        ratings: mergeRatings(profile.ratings, importedProfile.ratings || []),
        detailedRatings: mergeDetailedRatings(profile.detailedRatings, importedProfile.detailedRatings || []),
        genrePreferences: mergeGenrePreferences(profile.genrePreferences, importedProfile.genrePreferences || {}),
        creatorProfiles: mergeCreatorProfiles(profile.creatorProfiles, importedProfile.creatorProfiles || {}),
        studioProfiles: mergeStudioProfiles(profile.studioProfiles, importedProfile.studioProfiles || {}),
        followedCreators: mergeArrays(profile.followedCreators, importedProfile.followedCreators || []),
        followedStudios: mergeArrays(profile.followedStudios, importedProfile.followedStudios || []),
        lastUpdated: Date.now()
      };

      // Save merged profile
      saveProfile(mergedProfile);

      // Generate import result
      setImportResult({
        success: true,
        message: 'Data imported successfully! Your AI profile has been updated.',
        details: {
          importedRatings: importedProfile.ratings?.length || 0,
          importedDetailedRatings: importedProfile.detailedRatings?.length || 0,
          importedCreators: Object.keys(importedProfile.creatorProfiles || {}).length,
          importedStudios: Object.keys(importedProfile.studioProfiles || {}).length,
          updatedGenres: Object.keys(importedProfile.genrePreferences || {}).length
        }
      });

      // Close modal after successful import
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Failed to import data. Please check the file format and try again.'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Helper functions for merging data
  const mergeRatings = (existing: any[], imported: any[]) => {
    const merged = [...existing];
    imported.forEach(importedRating => {
      const existingIndex = merged.findIndex(r => r.contentId === importedRating.contentId);
      if (existingIndex >= 0) {
        // Keep the newer rating
        if (importedRating.timestamp > merged[existingIndex].timestamp) {
          merged[existingIndex] = importedRating;
        }
      } else {
        merged.push(importedRating);
      }
    });
    return merged;
  };

  const mergeDetailedRatings = (existing: any[], imported: any[]) => {
    const merged = [...existing];
    imported.forEach(importedRating => {
      const existingIndex = merged.findIndex(r => r.contentId === importedRating.contentId);
      if (existingIndex >= 0) {
        if (importedRating.timestamp > merged[existingIndex].timestamp) {
          merged[existingIndex] = importedRating;
        }
      } else {
        merged.push(importedRating);
      }
    });
    return merged;
  };

  const mergeGenrePreferences = (existing: any, imported: any) => {
    const merged = { ...existing };
    Object.keys(imported).forEach(genreId => {
      const existingPref = merged[genreId] || 5;
      const importedPref = imported[genreId];
      // Average the preferences for better merging
      merged[genreId] = (existingPref + importedPref) / 2;
    });
    return merged;
  };

  const mergeCreatorProfiles = (existing: any, imported: any) => {
    const merged = { ...existing };
    Object.keys(imported).forEach(creatorId => {
      const existingProfile = merged[creatorId];
      const importedProfile = imported[creatorId];
      
      if (existingProfile) {
        // Merge ratings
        const totalRatings = existingProfile.totalRatings + importedProfile.totalRatings;
        const combinedAverage = 
          (existingProfile.averageRating * existingProfile.totalRatings + 
           importedProfile.averageRating * importedProfile.totalRatings) / totalRatings;
        
        merged[creatorId] = {
          ...existingProfile,
          averageRating: combinedAverage,
          totalRatings: totalRatings
        };
      } else {
        merged[creatorId] = importedProfile;
      }
    });
    return merged;
  };

  const mergeStudioProfiles = (existing: any, imported: any) => {
    const merged = { ...existing };
    Object.keys(imported).forEach(studioId => {
      const existingProfile = merged[studioId];
      const importedProfile = imported[studioId];
      
      if (existingProfile) {
        const totalRatings = existingProfile.totalRatings + importedProfile.totalRatings;
        const combinedAverage = 
          (existingProfile.averageRating * existingProfile.totalRatings + 
           importedProfile.averageRating * importedProfile.totalRatings) / totalRatings;
        
        merged[studioId] = {
          ...existingProfile,
          averageRating: combinedAverage,
          totalRatings: totalRatings
        };
      } else {
        merged[studioId] = importedProfile;
      }
    });
    return merged;
  };

  const mergeArrays = (existing: any[], imported: any[]) => {
    const merged = [...existing];
    imported.forEach(item => {
      if (!merged.includes(item)) {
        merged.push(item);
      }
    });
    return merged;
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Process selected file
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        handleImport(importData);
      } catch (error) {
        setImportResult({
          success: false,
          message: 'Invalid JSON file. Please check the file format.'
        });
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const exportData = generateExportData();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Data Management</h2>
              <p className="text-gray-400 mt-1">Export or import your AI profile and ratings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'export', name: 'Export Data', icon: Download },
            { id: 'import', name: 'Import Data', icon: Upload }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Export Info */}
              <div className="bg-blue-600/10 rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Export Your AI Profile</h3>
                    <p className="text-blue-200 text-sm mb-4">
                      Create a complete backup of your ratings, preferences, and AI training data. 
                      This file can be imported later to restore your profile or transfer it to another device.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{exportData.metadata.totalRatings}</div>
                        <div className="text-blue-300">Ratings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{exportData.metadata.totalDetailedRatings}</div>
                        <div className="text-blue-300">Detailed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{exportData.metadata.followedCreators}</div>
                        <div className="text-blue-300">Creators</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400">{exportData.metadata.genrePreferences}</div>
                        <div className="text-blue-300">Genres</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Preview */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span>What's Included</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300">All Ratings</span>
                      </div>
                      <span className="text-green-400 text-sm">✓ Included</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">Genre Preferences</span>
                      </div>
                      <span className="text-green-400 text-sm">✓ Included</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">Creator Profiles</span>
                      </div>
                      <span className="text-green-400 text-sm">✓ Included</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">AI Training Data</span>
                      </div>
                      <span className="text-green-400 text-sm">✓ Included</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-300">Detailed Reviews</span>
                      </div>
                      <span className="text-green-400 text-sm">✓ Included</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-pink-400" />
                        <span className="text-gray-300">Recommendation Settings</span>
                      </div>
                      <span className="text-green-400 text-sm">✓ Included</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-3"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Export AI Profile</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Import Info */}
              <div className="bg-purple-600/10 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Import AI Profile</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      Restore or merge your AI profile from a previously exported file. 
                      Your existing data will be intelligently merged with the imported data.
                    </p>
                    <div className="bg-purple-500/20 rounded-lg p-3">
                      <p className="text-xs text-purple-300">
                        <strong>Smart Merge:</strong> Existing ratings with newer timestamps will be preserved. 
                        Genre preferences will be averaged for better recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-500/10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Drop your AI profile file here
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      or click to browse for a .json file
                    </p>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-medium rounded-lg transition-colors"
                  >
                    {isImporting ? 'Importing...' : 'Choose File'}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`rounded-xl p-6 border ${
                  importResult.success 
                    ? 'bg-green-600/10 border-green-500/20' 
                    : 'bg-red-600/10 border-red-500/20'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      importResult.success ? 'bg-green-600/20' : 'bg-red-600/20'
                    }`}>
                      {importResult.success ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold mb-2 ${
                        importResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {importResult.success ? 'Import Successful!' : 'Import Failed'}
                      </h4>
                      <p className={`text-sm mb-4 ${
                        importResult.success ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {importResult.message}
                      </p>
                      
                      {importResult.success && importResult.details && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-400">
                              {importResult.details.importedRatings}
                            </div>
                            <div className="text-green-300">Ratings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-400">
                              {importResult.details.importedDetailedRatings}
                            </div>
                            <div className="text-green-300">Detailed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-400">
                              {importResult.details.importedCreators}
                            </div>
                            <div className="text-green-300">Creators</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Import Instructions */}
              <div className="bg-gray-800/30 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Import Guidelines</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Only import files exported from CineMatch AI to ensure compatibility</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Existing data will be merged intelligently - no data will be lost</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>The AI will retrain automatically after import to incorporate new data</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Large import files may take a few moments to process</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};