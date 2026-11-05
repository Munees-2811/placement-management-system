import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

const DeleteDriveModal = ({ isOpen, onClose, onConfirm, drive, deleting }) => {
  if (!isOpen || !drive) return null;

  return (
    <div
      id="delete-drive-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose();
      }}
    >
      <div
        id="delete-drive-dialog"
        className="w-full max-w-md bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-[#D14343]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            id="delete-drive-cancel-x-btn"
            onClick={onClose}
            disabled={deleting}
            className="p-1.5 text-[#667085] hover:text-[#202B3C] rounded-lg hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="delete-drive-title" className="text-lg font-bold text-[#202B3C] mb-2">
          Delete Placement Drive?
        </h3>
        <p className="text-sm text-[#667085] mb-4 leading-relaxed">
          Are you sure you want to cancel and delete the drive for{' '}
          <span className="font-semibold text-[#202B3C]">"{drive.jobRole}"</span> by{' '}
          <span className="font-semibold text-[#202B3C]">{drive.company?.companyName || 'Company'}</span>?
          This will permanently remove the drive schedule and its eligibility criteria.
        </p>

        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] mb-6 text-xs text-[#667085] space-y-1">
          <div><strong className="text-[#202B3C]">Package:</strong> {drive.salaryPackage}</div>
          <div><strong className="text-[#202B3C]">Status:</strong> {drive.status}</div>
          <div><strong className="text-[#202B3C]">Batch:</strong> {drive.graduationYear}</div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            id="delete-drive-cancel-btn"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="delete-drive-proceed-btn"
            onClick={() => onConfirm(drive._id)}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D14343] hover:bg-red-700 text-white font-medium text-sm shadow-sm transition-all disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Drive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDriveModal;
