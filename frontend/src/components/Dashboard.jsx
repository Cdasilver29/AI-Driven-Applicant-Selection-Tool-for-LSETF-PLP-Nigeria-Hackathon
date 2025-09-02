import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Upload, Users, BarChart3, Settings, Search, Filter, Download, Star, Clock, CheckCircle, AlertCircle,
  X, Eye, Mail, Phone, Calendar, MapPin, Award, Briefcase, GraduationCap, FileText, Edit3, Save,
  RefreshCw, Trash2, Heart, MessageSquare, ChevronDown, ChevronUp, User, Building
} from 'lucide-react';

// Custom hooks for better state management
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage?.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, duration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};

// Optimized FileUpload component
const FileUpload = React.memo(({ onUploadComplete, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.includes('pdf') || 
      file.type.includes('doc') || 
      file.type.includes('application/msword')
    );
    
    if (files.length > 0) {
      onUploadComplete(files);
    }
  }, [onUploadComplete]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onUploadComplete(files);
    }
  }, [onUploadComplete]);

  return (
    <div className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-blue-300 hover:border-blue-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Processing files...</h3>
            <p className="mt-1 text-sm text-gray-500">AI is analyzing the uploaded documents</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-blue-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Upload CV/Resume Files</h3>
            <p className="mt-1 text-sm text-gray-500">Drag and drop files or click to browse</p>
            <p className="mt-1 text-xs text-gray-400">Supports PDF, DOC, DOCX files (max 10MB each)</p>
            <label className="mt-4 inline-block">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
              <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                Choose Files
              </span>
            </label>
          </>
        )}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Upload Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload multiple files at once for batch processing</li>
          <li>• Ensure files are clear and well-formatted for best AI analysis</li>
          <li>• Processing time varies based on file size and complexity</li>
        </ul>
      </div>
    </div>
  );
});

// Enhanced CandidateModal component
const CandidateModal = ({ candidate, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(candidate);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (candidate) {
      setEditData(candidate);
    }
  }, [candidate]);

  if (!isOpen || !candidate) return null;

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusBadge = (score) => {
    if (score >= 85) return { text: 'Excellent Match', color: 'bg-emerald-500' };
    if (score >= 70) return { text: 'Good Match', color: 'bg-amber-500' };
    return { text: 'Needs Review', color: 'bg-red-500' };
  };

  const status = getStatusBadge(candidate.score);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="border border-gray-300 rounded px-2 py-1"
                />
              ) : (
                candidate.name
              )}
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
              {status.text}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="mr-2" size={18} />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-gray-400" size={16} />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({...editData, email: e.target.value})}
                        className="border border-gray-300 rounded px-2 py-1 flex-1"
                      />
                    ) : (
                      <span className="text-gray-700">{candidate.email}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="text-gray-400" size={16} />
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                        className="border border-gray-300 rounded px-2 py-1 flex-1"
                      />
                    ) : (
                      <span className="text-gray-700">{candidate.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="mr-2" size={18} />
                  Skills & Competencies
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Technical Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills?.filter(skill => skill.category === 'technical').map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {skill.name}
                          <span className="ml-1 text-xs text-blue-600">
                            ({Math.round(skill.confidence * 100)}%)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Soft Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills?.filter(skill => skill.category === 'soft').map((skill, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                        >
                          {skill.name}
                          <span className="ml-1 text-xs text-emerald-600">
                            ({Math.round(skill.confidence * 100)}%)
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="mr-2" size={18} />
                  Notes & Comments
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this candidate..."
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Save Note
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* AI Score Breakdown */}
              <div className={`border-2 rounded-lg p-4 ${getScoreColor(candidate.score)}`}>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Star className="mr-2" size={18} />
                  AI Assessment Score
                </h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold">{candidate.score}</div>
                  <div className="text-sm opacity-80">out of 100</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Skills Match</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-current h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Experience Level</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-current h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Education Fit</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-current h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2">
                    <Heart size={16} />
                    <span>Add to Shortlist</span>
                  </button>
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Mail size={16} />
                    <span>Send Interview Invite</span>
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <Download size={16} />
                    <span>Download CV</span>
                  </button>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                    <Trash2 size={16} />
                    <span>Remove Candidate</span>
                  </button>
                </div>
              </div>

              {/* File Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="mr-2" size={18} />
                  File Details
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div><span className="font-medium">Filename:</span> {candidate.file}</div>
                  <div><span className="font-medium">Processed:</span> {new Date(candidate.processedAt).toLocaleString()}</div>
                  <div><span className="font-medium">File Size:</span> 2.3 MB</div>
                  <div><span className="font-medium">Processing Time:</span> 1.2s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Optimized CandidateList with virtualization for large lists
const CandidateList = React.memo(({ candidates, onCandidateUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized filtered and sorted candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.skills?.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilter = (() => {
          if (filterScore === 'high') return candidate.score >= 85;
          if (filterScore === 'medium') return candidate.score >= 70 && candidate.score < 85;
          if (filterScore === 'low') return candidate.score < 70;
          return true;
        })();

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'score') return b.score - a.score;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'date') return new Date(b.processedAt) - new Date(a.processedAt);
        return 0;
      });
  }, [candidates, searchTerm, filterScore, sortBy]);

  const handleViewDetails = useCallback((candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Score', 'Skills', 'File'],
      ...filteredCandidates.map(candidate => [
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.score,
        candidate.skills?.map(s => s.name).join('; ') || '',
        candidate.file
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredCandidates]);

  const CandidateCard = React.memo(({ candidate }) => {
    const getScoreColor = (score) => {
      if (score >= 85) return 'text-emerald-600 bg-emerald-50';
      if (score >= 70) return 'text-amber-600 bg-amber-50';
      return 'text-red-600 bg-red-50';
    };

    const getStatusIcon = (score) => {
      if (score >= 85) return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      if (score >= 70) return <Clock className="w-4 h-4 text-amber-600" />;
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
              {getStatusIcon(candidate.score)}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {candidate.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {candidate.phone}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Processed {new Date(candidate.processedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(candidate.score)}`}>
              <Star className="w-3 h-3 mr-1" />
              {candidate.score}/100
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Skills</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills?.slice(0, 4).map((skill, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill.name}
              </span>
            ))}
            {candidate.skills?.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{candidate.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            {candidate.file}
          </span>
          <div className="flex space-x-3">
            <button 
              onClick={() => handleViewDetails(candidate)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
            <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center space-x-1 transition-colors">
              <Heart className="w-4 h-4" />
              <span>Shortlist</span>
            </button>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filter Bar */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, skills, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <select 
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
            >
              <option value="all">All Scores</option>
              <option value="high">High (85+)</option>
              <option value="medium">Medium (70-84)</option>
              <option value="low">Low (&lt;70)</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px]"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
            </select>
            
            <button 
              onClick={handleExport}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </span>
          {searchTerm && (
            <span className="text-blue-600">
              Search results for "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Users className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No candidates found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            {candidates.length === 0 
              ? 'Upload some CV files to get started with AI-powered candidate analysis.' 
              : 'Try adjusting your search terms or filters to find relevant candidates.'}
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCandidates.map(candidate => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      )}

      {/* Candidate Detail Modal */}
      <CandidateModal 
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={onCandidateUpdate}
      />
    </div>
  );
});

// Enhanced Analytics with real-time updates
const Analytics = React.memo(({ metrics, candidates }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('score');

  const scoreDistribution = useMemo(() => ({
    high: candidates.filter(c => c.score >= 85).length,
    medium: candidates.filter(c => c.score >= 70 && c.score < 85).length,
    low: candidates.filter(c => c.score < 70).length
  }), [candidates]);

  const skillsAnalysis = useMemo(() => {
    const allSkills = candidates.flatMap(c => c.skills || []);
    const skillCounts = {};
    const skillConfidence = {};
    
    allSkills.forEach(skill => {
      skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
      if (!skillConfidence[skill.name]) {
        skillConfidence[skill.name] = [];
      }
      skillConfidence[skill.name].push(skill.confidence);
    });

    return Object.entries(skillCounts)
      .map(([name, count]) => ({
        name,
        count,
        avgConfidence: skillConfidence[name].reduce((a, b) => a + b, 0) / skillConfidence[name].length,
        percentage: candidates.length > 0 ? (count / candidates.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [candidates]);

  const processingStats = useMemo(() => {
    if (candidates.length === 0) return { dailyProcessed: [], totalToday: 0, avgProcessingTime: 0 };
    
    const today = new Date().toDateString();
    const totalToday = candidates.filter(c => 
      new Date(c.processedAt).toDateString() === today
    ).length;

    return {
      totalToday,
      avgProcessingTime: 1.2, // Mock average
      totalFiles: candidates.length,
      successRate: 98.5 // Mock success rate
    };
  }, [candidates]);

  return (
    <div className="space-y-8">
      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Processed</p>
              <p className="text-3xl font-bold">{metrics.totalProcessed}</p>
              <p className="text-blue-100 text-xs mt-1">+{processingStats.totalToday} today</p>
            </div>
            <Users className="h-10 w-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Average Score</p>
              <p className="text-3xl font-bold">{metrics.averageScore.toFixed(1)}</p>
              <p className="text-emerald-100 text-xs mt-1">Industry benchmark: 75.2</p>
            </div>
            <Star className="h-10 w-10 text-emerald-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">High Performers</p>
              <p className="text-3xl font-bold">{scoreDistribution.high}</p>
              <p className="text-purple-100 text-xs mt-1">
                {candidates.length > 0 ? Math.round((scoreDistribution.high / candidates.length) * 100) : 0}% of total
              </p>
            </div>
            <Award className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold">{processingStats.successRate}%</p>
              <p className="text-amber-100 text-xs mt-1">Avg processing: {processingStats.avgProcessingTime}s</p>
            </div>
            <CheckCircle className="h-10 w-10 text-amber-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Score Distribution Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Score Distribution Analysis</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{scoreDistribution.high}</div>
                <div className="text-sm text-emerald-700">High (85+)</div>
                <div className="text-xs text-emerald-600">
                  {candidates.length > 0 ? Math.round((scoreDistribution.high / candidates.length) * 100) : 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{scoreDistribution.medium}</div>
                <div className="text-sm text-amber-700">Medium (70-84)</div>
                <div className="text-xs text-amber-600">
                  {candidates.length > 0 ? Math.round((scoreDistribution.medium / candidates.length) * 100) : 0}%
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{scoreDistribution.low}</div>
                <div className="text-sm text-red-700">Low (&lt;70)</div>
                <div className="text-xs text-red-600">
                  {candidates.length > 0 ? Math.round((scoreDistribution.low / candidates.length) * 100) : 0}%
                </div>
              </div>
            </div>

            {candidates.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">High Performers (85+)</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-40 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(scoreDistribution.high / candidates.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 w-12 text-right">{scoreDistribution.high}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Medium Performers (70-84)</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-40 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-amber-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(scoreDistribution.medium / candidates.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 w-12 text-right">{scoreDistribution.medium}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Needs Improvement (&lt;70)</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-40 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(scoreDistribution.low / candidates.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900 w-12 text-right">{scoreDistribution.low}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Skills Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Skills Analysis</h3>
            <div className="text-xs text-gray-500">Top 10</div>
          </div>
          
          <div className="space-y-4">
            {skillsAnalysis.length > 0 ? (
              skillsAnalysis.map((skill, index) => (
                <div key={skill.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{skill.count} candidates</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {Math.round(skill.avgConfidence * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${skill.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-8">#{index + 1}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Award className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm">No skills data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Processing Insights */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">AI Processing Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{processingStats.avgProcessingTime}s</div>
            <div className="text-sm text-gray-600">Avg Processing Time</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{processingStats.successRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{candidates.length}</div>
            <div className="text-sm text-gray-600">Total Files Processed</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{processingStats.totalToday}</div>
            <div className="text-sm text-gray-600">Processed Today</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Enhanced Settings Panel with working functionality
const SettingsPanel = React.memo(() => {
  const [settings, setSettings] = useLocalStorage('aiSettings', {
    minScoreThreshold: 70,
    skillsWeight: 50,
    experienceWeight: 30,
    educationWeight: 20,
    autoShortlist: true,
    emailNotifications: true,
    processingMode: 'balanced'
  });

  const [tempSettings, setTempSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  useEffect(() => {
    setHasChanges(JSON.stringify(tempSettings) !== JSON.stringify(settings));
  }, [tempSettings, settings]);

  const handleSettingChange = (key, value) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(() => {
    setSettings(tempSettings);
    setHasChanges(false);
    addNotification('Settings saved successfully!', 'success');
  }, [tempSettings, setSettings, addNotification]);

  const handleReset = useCallback(() => {
    const defaultSettings = {
      minScoreThreshold: 70,
      skillsWeight: 50,
      experienceWeight: 30,
      educationWeight: 20,
      autoShortlist: true,
      emailNotifications: true,
      processingMode: 'balanced'
    };
    setTempSettings(defaultSettings);
    setSettings(defaultSettings);
    setHasChanges(false);
    addNotification('Settings reset to defaults!', 'info');
  }, [setSettings, addNotification]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-2xl font-bold text-gray-900">AI Model Configuration</h3>
        <p className="text-gray-600 mt-1">Fine-tune the AI scoring parameters to match your hiring criteria</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Scoring Parameters */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="mr-2" size={20} />
              Scoring Parameters
            </h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Minimum Score Threshold: {tempSettings.minScoreThreshold}
                </label>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  value={tempSettings.minScoreThreshold}
                  onChange={(e) => handleSettingChange('minScoreThreshold', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>50 (Lenient)</span>
                  <span>95 (Strict)</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Candidates below this score will be flagged for manual review
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Skills Weight: {tempSettings.skillsWeight}%
                </label>
                <input 
                  type="range" 
                  min="20" 
                  max="80" 
                  value={tempSettings.skillsWeight}
                  onChange={(e) => handleSettingChange('skillsWeight', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>20%</span>
                  <span>80%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Experience Weight: {tempSettings.experienceWeight}%
                </label>
                <input 
                  type="range" 
                  min="10" 
                  max="70" 
                  value={tempSettings.experienceWeight}
                  onChange={(e) => handleSettingChange('experienceWeight', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10%</span>
                  <span>70%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Education Weight: {tempSettings.educationWeight}%
                </label>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={tempSettings.educationWeight}
                  onChange={(e) => handleSettingChange('educationWeight', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>5%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Weight validation */}
              <div className="bg-white rounded-lg p-4 border">
                <div className="text-sm">
                  <span className="font-medium">Total Weight: </span>
                  <span className={`font-bold ${
                    tempSettings.skillsWeight + tempSettings.experienceWeight + tempSettings.educationWeight === 100
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {tempSettings.skillsWeight + tempSettings.experienceWeight + tempSettings.educationWeight}%
                  </span>
                </div>
                {tempSettings.skillsWeight + tempSettings.experienceWeight + tempSettings.educationWeight !== 100 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Weights should total 100% for optimal scoring accuracy
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Processing & Automation */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Processing & Automation
            </h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Processing Mode
                </label>
                <select
                  value={tempSettings.processingMode}
                  onChange={(e) => handleSettingChange('processingMode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="fast">Fast (Basic analysis)</option>
                  <option value="balanced">Balanced (Recommended)</option>
                  <option value="thorough">Thorough (Deep analysis)</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {tempSettings.processingMode === 'fast' && 'Quick processing with basic skill matching'}
                  {tempSettings.processingMode === 'balanced' && 'Optimal balance of speed and accuracy'}
                  {tempSettings.processingMode === 'thorough' && 'Comprehensive analysis including context understanding'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto-shortlist high performers</label>
                    <p className="text-xs text-gray-500">Automatically add candidates scoring 90+ to shortlist</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('autoShortlist', !tempSettings.autoShortlist)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tempSettings.autoShortlist ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tempSettings.autoShortlist ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email notifications</label>
                    <p className="text-xs text-gray-500">Get notified when processing completes</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('emailNotifications', !tempSettings.emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      tempSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tempSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current Configuration Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Min Score:</span>
                  <span className="font-medium">{tempSettings.minScoreThreshold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills:</span>
                  <span className="font-medium">{tempSettings.skillsWeight}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{tempSettings.experienceWeight}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Education:</span>
                  <span className="font-medium">{tempSettings.educationWeight}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium capitalize">{tempSettings.processingMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto-shortlist:</span>
                  <span className={`font-medium ${tempSettings.autoShortlist ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {tempSettings.autoShortlist ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {hasChanges && '⚠️ You have unsaved changes'}
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleReset}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 font-medium ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
});

// Main Dashboard Component
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [candidates, setCandidates] = useLocalStorage('candidates', []);
  const [isProcessing, setIsProcessing] = useState(false);
  const { notifications, addNotification } = useNotifications();

  const [metrics, setMetrics] = useState({
    totalProcessed: 0,
    averageScore: 0,
    topSkills: []
  });

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload, color: 'blue' },
    { id: 'candidates', label: 'Candidates', icon: Users, color: 'emerald' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'purple' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' }
  ];

  // Update metrics when candidates change
  useEffect(() => {
    if (candidates.length > 0) {
      const totalProcessed = candidates.length;
      const averageScore = candidates.reduce((sum, candidate) => sum + (candidate.score || 0), 0) / totalProcessed;
      
      // Extract top skills from all candidates
      const allSkills = candidates.flatMap(candidate => candidate.skills || []);
      const skillCounts = {};
      
      allSkills.forEach(skill => {
        skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
      });
      
      const topSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

      setMetrics({
        totalProcessed,
        averageScore,
        topSkills
      });
    } else {
      setMetrics({
        totalProcessed: 0,
        averageScore: 0,
        topSkills: []
      });
    }
  }, [candidates]);

  const handleUploadComplete = useCallback((files) => {
    setIsProcessing(true);
    addNotification(`Processing ${files.length} files...`, 'info');

    // Simulate AI processing delay
    setTimeout(() => {
      const newCandidates = files.map((file, index) => {
        // Extract name from filename (remove extension and replace underscores with spaces)
        let name = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/_/g, " ")
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        // Use "Calvine Dasilver" as the first candidate name, then generate others
        if (index === 0 && files.length > 0) {
          name = "Calvine Dasilver";
        }

        // Generate a weighted random score (higher scores more likely)
        const random = Math.random();
        let score;
        if (random < 0.3) score = Math.floor(Math.random() * 15) + 85; // 30% high scores
        else if (random < 0.7) score = Math.floor(Math.random() * 15) + 70; // 40% medium scores
        else score = Math.floor(Math.random() * 10) + 60; // 30% low scores
        
        // Generate a professional email
        const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        
        // Generate a phone number
        const phone = `+234 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Generate relevant skills with categories
        const technicalSkills = ['JavaScript', 'React', 'Python', 'Node.js', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Git', 'MongoDB'];
        const softSkills = ['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Project Management'];
        const skills = [];
        
        // Add 3-5 technical skills
        const numTechSkills = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numTechSkills; i++) {
          const randomSkill = technicalSkills[Math.floor(Math.random() * technicalSkills.length)];
          if (!skills.some(s => s.name === randomSkill)) {
            skills.push({
              name: randomSkill,
              category: 'technical',
              confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
            });
          }
        }
        
        // Add 1-2 soft skills
        const numSoftSkills = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numSoftSkills; i++) {
          const randomSkill = softSkills[Math.floor(Math.random() * softSkills.length)];
          if (!skills.some(s => s.name === randomSkill)) {
            skills.push({
              name: randomSkill,
              category: 'soft',
              confidence: Math.random() * 0.2 + 0.8 // 0.8-1.0
            });
          }
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          name,
          email,
          phone,
          score,
          skills,
          file: file.name,
          processedAt: new Date().toISOString(),
          status: score >= 85 ? 'shortlisted' : score >= 70 ? 'reviewed' : 'pending',
          notes: []
        };
      });

      setCandidates(prevCandidates => [...prevCandidates, ...newCandidates]);
      setIsProcessing(false);
      
      // Show success notification with details
      const highPerformers = newCandidates.filter(c => c.score >= 85).length;
      addNotification(
        `Successfully processed ${files.length} candidates. ${highPerformers} high performers identified!`, 
        'success'
      );
      
      setActiveTab('candidates');
    }, 2000); // Realistic processing time
  }, [setCandidates, addNotification]);

  const handleCandidateUpdate = useCallback((updatedCandidate) => {
    setCandidates(prev => prev.map(c => 
      c.id === updatedCandidate.id ? updatedCandidate : c
    ));
    addNotification('Candidate updated successfully!', 'success');
  }, [setCandidates, addNotification]);

  const getTabColorClasses = (tabId, isActive) => {
    const tab = tabs.find(t => t.id === tabId);
    const baseClasses = "flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ";
    
    if (isActive) {
      switch (tab?.color) {
        case 'blue': return baseClasses + 'bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200';
        case 'emerald': return baseClasses + 'bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200';
        case 'purple': return baseClasses + 'bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200';
        case 'gray': return baseClasses + 'bg-gray-100 text-gray-700 shadow-sm ring-1 ring-gray-200';
        default: return baseClasses + 'bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200';
      }
    }
    
    return baseClasses + 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upload':
        return <FileUpload onUploadComplete={handleUploadComplete} isProcessing={isProcessing} />;
      case 'candidates':
        return <CandidateList candidates={candidates} onCandidateUpdate={handleCandidateUpdate} />;
      case 'analytics':
        return <Analytics metrics={metrics} candidates={candidates} />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <div className="text-center py-16">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Select a tab to get started</h3>
            <p className="text-gray-500 mt-2">Choose from the options above to begin managing candidates.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Notifications System */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div key={notification.id} className={`rounded-lg p-4 shadow-lg max-w-sm transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-emerald-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{notification.message}</p>
              <button 
                onClick={() => removeNotification(notification.id)}
                className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LSETF AI Talent Hub
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  AI-powered platform for analyzing applicant data and identifying top talent
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isProcessing ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                <span className="text-gray-600">
                  {isProcessing ? 'Processing...' : 'AI Engine Active'}
                </span>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                {candidates.length} Candidates Processed
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                {candidates.filter(c => c.score >= 85).length} High Performers
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl shadow-sm mb-8 border border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={getTabColorClasses(tab.id, activeTab === tab.id)}
              >
                <Icon size={18} className="mr-2" />
                {tab.label}
                {tab.id === 'candidates' && candidates.length > 0 && (
                  <span className="ml-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {candidates.length}
                  </span>
                )}
                {tab.id === 'analytics' && candidates.filter(c => c.score >= 85).length > 0 && (
                  <span className="ml-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {candidates.filter(c => c.score >= 85).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Content with Enhanced Styling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden backdrop-blur-sm bg-white/95">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
      
      {/* Enhanced Custom CSS */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          border: 2px solid white;
          transition: all 0.2s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
        }
        .slider::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
        }
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
        }
        .slider::-webkit-slider-track {
          background: linear-gradient(90deg, #EF4444, #F59E0B, #10B981);
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;