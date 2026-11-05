import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, FileEdit, Loader2, Upload, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ResumeModal = ({ resume, isOpen, onClose, onSave, saving }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null); // { name, size }
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setPreview(null);
      setError('');
      setDragOver(false);
    }
  }, [isOpen]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (file) => {
    setError('');
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed. Please select a .pdf file.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    setSelectedFile(file);
    setPreview({ name: file.name, size: file.size });
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF file to upload.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await api.post('/student/profile/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSave(response.data.data?.resume || null, response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const isLoading = uploading || saving;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {resume?.url ? 'Replace Resume' : 'Upload Resume'}
              </h2>
              <p className="text-xs text-slate-400">PDF only · Max {MAX_SIZE_MB} MB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Current resume info */}
          {resume?.url && !selectedFile && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate">{resume.fileName || 'Current Resume'}</p>
                <p className="text-[11px] text-slate-500">Currently saved — upload a new file to replace it</p>
              </div>
            </div>
          )}

          {/* Drop Zone */}
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none
                ${dragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/60'
                }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-200">
                  {dragOver ? 'Drop your PDF here' : 'Click to browse or drag & drop'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Accepts <span className="text-red-400 font-semibold">.pdf</span> files only · Max {MAX_SIZE_MB} MB
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            /* Selected file preview */
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/25">
              {/* PDF icon */}
              <div className="w-10 h-12 bg-slate-800 border border-slate-700 rounded-lg flex flex-col items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
                <span className="text-[8px] font-bold text-red-400 tracking-widest mt-0.5">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-slate-100 truncate">{preview.name}</p>
                </div>
                <p className="text-xs text-slate-500">{formatBytes(preview.size)}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isLoading ? 'Uploading...' : resume?.url ? 'Replace Resume' : 'Upload Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeModal;
