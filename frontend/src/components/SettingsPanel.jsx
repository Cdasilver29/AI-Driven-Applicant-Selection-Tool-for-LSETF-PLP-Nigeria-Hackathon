import React from 'react';
import { Save, RotateCcw } from 'lucide-react';

const SettingsPanel = () => {
  const [weights, setWeights] = React.useState({
    technical: 30,
    experience: 25,
    education: 20,
    softSkills: 15,
    portfolio: 10
  });

  const handleWeightChange = (category, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setWeights(prev => ({
        ...prev,
        [category]: numValue
      }));
    }
  };

  const resetWeights = () => {
    setWeights({
      technical: 30,
      experience: 25,
      education: 20,
      softSkills: 15,
      portfolio: 10
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Scoring Settings</h2>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Scoring Weights</h3>
        
        <div className="space-y-4">
          {Object.entries(weights).map(([category, weight]) => (
            <div key={category} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 capitalize">
                {category.replace(/([A-Z])/g, ' $1')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weight}
                  onChange={(e) => handleWeightChange(category, e.target.value)}
                  className="w-24"
                />
                <span className="w-12 text-sm font-medium text-gray-900">{weight}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button className="flex items-center px-4 py-2 bg-lsetf-primary-500 text-white rounded-md hover:bg-lsetf-primary-600">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
          <button 
            onClick={resetWeights}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;