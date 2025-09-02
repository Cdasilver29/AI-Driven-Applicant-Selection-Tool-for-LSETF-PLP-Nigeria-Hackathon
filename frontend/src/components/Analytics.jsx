import React from 'react';
import { BarChart3, Users, FileText, TrendingUp } from 'lucide-react';

const Analytics = ({ metrics, candidates }) => {
  const stats = {
    totalProcessed: candidates?.length || 0,
    averageScore: candidates?.reduce((sum, c) => sum + (c.score || 0), 0) / (candidates?.length || 1) || 0,
    topSkills: ['JavaScript', 'React', 'Python', 'Node.js']
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-lsetf-primary-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Processed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProcessed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-lsetf-primary-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-lsetf-primary-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProcessed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Skills</h3>
        <div className="space-y-3">
          {stats.topSkills.map((skill, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{skill}</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-lsetf-primary-500 h-2 rounded-full"
                  style={{ width: `${75 - (index * 15)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;