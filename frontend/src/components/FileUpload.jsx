import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

const FileUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const abortControllerRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = async (newFiles) => {
    const validFiles = newFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.pdf') ||
      file.name.endsWith('.docx')
    );

    if (validFiles.length === 0) {
      alert('Please upload PDF or DOCX files only');
      return;
    }

    // Check file sizes (max 20MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 20 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`The following files exceed the 20MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
    setIsUploading(true);
    
    // Create a new AbortController for this upload
    abortControllerRef.current = new AbortController();
    
    // Initialize upload status and progress
    const initialStatus = {};
    const initialProgress = {};
    validFiles.forEach(file => {
      initialStatus[file.name] = 'pending';
      initialProgress[file.name] = 0;
    });
    setUploadStatus(prev => ({ ...prev, ...initialStatus }));
    setUploadProgress(prev => ({ ...prev, ...initialProgress }));

    // Prepare FormData
    const formData = new FormData();
    validFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('http://localhost:8000/api/candidates/upload', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update status to success
        const successStatus = {};
        validFiles.forEach(file => {
          successStatus[file.name] = 'success';
        });
        setUploadStatus(prev => ({ ...prev, ...successStatus }));
        
        // Set progress to 100%
        const completeProgress = {};
        validFiles.forEach(file => {
          completeProgress[file.name] = 100;
        });
        setUploadProgress(prev => ({ ...prev, ...completeProgress }));
        
        if (onUploadComplete) {
          onUploadComplete(data.candidates);
        }
      } else {
        // Handle server errors
        const errorStatus = {};
        validFiles.forEach(file => {
          errorStatus[file.name] = 'error';
        });
        setUploadStatus(prev => ({ ...prev, ...errorStatus }));
        
        console.error('Upload failed with status:', response.status);
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Upload cancelled');
      } else {
        // Handle network errors
        const errorStatus = {};
        validFiles.forEach(file => {
          errorStatus[file.name] = 'error';
        });
        setUploadStatus(prev => ({ ...prev, ...errorStatus }));
        
        console.error('Error uploading files:', error);
        alert('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileName) => {
    // If upload is in progress, abort it
    if (isUploading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsUploading(false);
    }
    
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'error') {
      return <AlertCircle className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-lsetf-primary-500 bg-lsetf-primary-50' 
            : 'border-gray-300 hover:border-lsetf-primary-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isUploading ? 'Uploading files...' : 'Drop resumes here or click to upload'}
        </p>
        <p className="text-sm text-gray-500">
          Supports PDF and DOCX files (Max 20MB each)
        </p>
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Files</h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                uploadStatus[file.name] === 'error' ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    {uploadStatus[file.name] && (
                      <div className={`flex items-center text-xs ${getStatusColor(uploadStatus[file.name])}`}>
                        {getStatusIcon(uploadStatus[file.name])}
                        <span className="ml-1">
                          {uploadStatus[file.name] === 'success' && 'Upload complete'}
                          {uploadStatus[file.name] === 'error' && 'Upload failed'}
                          {uploadStatus[file.name] === 'pending' && 'Uploading...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-lsetf-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;