import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, company, deleting }) => {
  if (!isOpen || !company) return null;

  return (
    <div
      id="delete-confirm-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div
        id="delete-confirm-dialog"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            id="delete-confirm-cancel-x-btn"
            onClick={onClose}
            disabled={deleting}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="delete-confirm-title" className="text-lg font-bold text-white mb-2">
          Delete Company Record?
        </h3>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          Are you sure you want to delete <span className="font-semibold text-white">"{company.companyName}"</span>?
          This action will permanently remove this company and all its recruitment contacts from the placement portal.
        </p>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-6 text-xs text-slate-400 space-y-1">
          <div><strong className="text-slate-300">Industry:</strong> {company.industry}</div>
          <div><strong className="text-slate-300">Location:</strong> {company.location}</div>
          <div><strong className="text-slate-300">Contact:</strong> {company.contactPerson} ({company.contactEmail})</div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            id="delete-confirm-cancel-btn"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="delete-confirm-proceed-btn"
            onClick={() => onConfirm(company._id)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm shadow-lg shadow-rose-600/25 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Company</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
