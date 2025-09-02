import React from 'react';
import { User, Star, Mail, Phone } from 'lucide-react';

const CandidateList = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No candidates found. Upload resumes to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Candidate Rankings</h2>
      {candidates.map((candidate, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-lsetf-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-lsetf-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{candidate.name || 'Unknown Candidate'}</h3>
                <p className="text-sm text-gray-500">{candidate.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-lg font-semibold text-gray-900">{candidate.score}/100</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{candidate.email || 'No email'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{candidate.phone || 'No phone'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CandidateList;