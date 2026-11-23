import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, CheckCircle2, Clock, File, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../../utils/api';
import toast from 'react-hot-toast';

const DocumentUploader = ({ documents, onDocumentUploaded, onDocumentDeleted, selectedDocId, onSelectDoc }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const validExtensions = ['.pdf', '.txt', '.md', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast.error('Supported formats: PDF, TXT, MD, DOC, DOCX');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be under 25MB');
      return;
    }
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title || selectedFile.name);

    try {
      setUploading(true);
      toast.loading('Analyzing document with AI extractor...', { id: 'uploadToast' });

      const { data } = await axiosInstance.post('/learning/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Document uploaded and indexed!', { id: 'uploadToast' });
      setSelectedFile(null);
      setTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onDocumentUploaded) onDocumentUploaded(data.document);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload document', { id: 'uploadToast' });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
          Upload Technical Documents
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Upload technical specs, architecture guides, interview prep PDFs, or text notes for grounded AI learning.
        </p>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : selectedFile
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt,.md,.doc,.docx"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{formatFileSize(selectedFile.size)}</p>
                <span className="text-[11px] text-indigo-600 mt-2 hover:underline">Click or drag to change file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-2xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Click to browse or drag and drop your document
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, TXT, MD, DOC, DOCX up to 25MB
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                placeholder="Document Title (e.g. System Design Handbook)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
              />
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing & Extracting...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Process & Index Document</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Document Library
            </h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} ready for AI analysis
            </p>
          </div>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const isSelected = selectedDocId === doc._id;
              return (
                <div
                  key={doc._id}
                  onClick={() => onSelectDoc(doc._id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/20 ring-1 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        <File className="w-3 h-3 text-indigo-600" />
                        {doc.fileType}
                      </span>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full font-mono">
                            Active
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDocumentDeleted(doc._id);
                          }}
                          title="Delete document"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1">
                      {doc.title}
                    </h5>

                    {doc.summary && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {doc.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No documents in library</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Upload a PDF or text file above to start grounded AI learning.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploader;
