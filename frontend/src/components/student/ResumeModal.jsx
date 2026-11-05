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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E8EF] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#3569A8]">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202B3C]">
                {resume?.url ? 'Replace Resume Document' : 'Upload Resume Document'}
              </h2>
              <p className="text-xs text-[#667085]">PDF format only · Max {MAX_SIZE_MB} MB file size</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isLoading}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current resume info if already uploaded */}
          {resume?.url && !selectedFile && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF]">
              <div className="w-8 h-9 rounded bg-[#EFF6FF] border border-[#BFDBFE] flex flex-col items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#3569A8]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#202B3C] truncate">{resume.fileName || 'Current Resume'}</p>
                <p className="text-[11px] text-[#667085]">Currently on file — select a new PDF below to replace it</p>
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
              className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none ${
                dragOver
                  ? 'border-[#3569A8] bg-[#EFF6FF]'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#3569A8] hover:bg-[#F1F5F9]'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E4E8EF] flex items-center justify-center text-[#3569A8] shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-[#202B3C]">
                  {dragOver ? 'Drop PDF file here' : 'Click to browse or drag & drop'}
                </p>
                <p className="text-xs text-[#667085] mt-1">
                  Accepts <span className="text-[#D14343] font-semibold">.pdf</span> documents only · Maximum {MAX_SIZE_MB} MB
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
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#EBFDF5] border border-[#A7F3D0]">
              <div className="w-9 h-10 bg-white border border-[#A7F3D0] rounded-lg flex flex-col items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#D14343]" />
                <span className="text-[7px] font-bold text-[#D14343] tracking-widest mt-0.5">PDF</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B] shrink-0" />
                  <p className="text-xs font-semibold text-[#202B3C] truncate">{preview?.name}</p>
                </div>
                <p className="text-[11px] text-[#667085]">{formatBytes(preview?.size || 0)}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg text-[#667085] hover:text-[#D14343] hover:bg-white transition-colors shrink-0"
                title="Remove selected file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#D14343] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E8EF]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] border border-[#E4E8EF] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#132B4A] text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{resume?.url ? 'Save New Resume' : 'Upload Resume'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeModal;
