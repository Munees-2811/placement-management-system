import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'UPCOMING':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    case 'ONGOING':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'COMPLETED':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  }
};

/**
 * Compact eligibility pill for table rows (student only)
 */
const EligibilityPill = ({ eligibility }) => {
  if (!eligibility) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
        <Info className="w-3 h-3" />
        Checking…
      </span>
    );
  }

  if (eligibility.profileIncomplete) {
    return (
      <span
        id="table-eligibility-incomplete"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/50 text-amber-300 border border-amber-500/30"
        title="Complete your profile to check eligibility"
      >
        <AlertTriangle className="w-3 h-3" />
        Profile Incomplete
      </span>
    );
  }

  if (eligibility.eligible) {
    return (
      <span
        id="table-eligibility-eligible"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30"
      >
        <CheckCircle2 className="w-3 h-3" />
        Eligible
      </span>
    );
  }

  // Not eligible — show first concise reason on hover title
  const firstReason = eligibility.reasons?.[0] || 'Does not meet requirements';
  return (
    <span
      id="table-eligibility-not-eligible"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-950/50 text-rose-300 border border-rose-500/30"
      title={`Not Eligible: ${firstReason}`}
    >
      <XCircle className="w-3 h-3" />
      Not Eligible
    </span>
  );
};

const DriveTableView = ({
  drives,
  canManage,
  onEdit,
  onDelete,
  onView,
  eligibilityMap = {},
  isStudent,
  applicationMap = {},
  onApply,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-4 px-6 font-semibold">Job Role &amp; Company</th>
              <th className="py-4 px-6 font-semibold">Package (CTC)</th>
              <th className="py-4 px-6 font-semibold">Eligibility Criteria</th>
              {isStudent && <th className="py-4 px-6 font-semibold">Your Status</th>}
              <th className="py-4 px-6 font-semibold">Drive Date</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {drives.map((drive) => {
              const companyName = drive.company?.companyName || 'Corporate Partner';
              const eligibility = eligibilityMap[drive._id] || null;
              const application = applicationMap[drive._id] || null;
              const hasApplied = Boolean(application);
              const isDeadlinePassed = drive.applicationDeadline
                ? new Date(drive.applicationDeadline).getTime() < Date.now()
                : false;
              const canApply = isStudent && !hasApplied && eligibility?.eligible && !isDeadlinePassed;
              return (
                <tr
                  key={drive._id}
                  id={`drive-row-${drive._id}`}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  {/* Job Role and Company */}
                  <td className="py-4 px-6">
                    <div>
                      <button
                        onClick={() => onView(drive)}
                        className="font-bold text-white hover:text-indigo-300 text-left transition-colors truncate max-w-[220px] block"
                      >
                        {drive.jobRole}
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="truncate max-w-[180px]">{companyName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Salary Package */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                      <DollarSign className="w-3 h-3" />
                      {drive.salaryPackage}
                    </span>
                  </td>

                  {/* Academic Criteria — highlight failed criteria for students */}
                  <td className="py-4 px-6 text-xs">
                    <div>
                      <span className={`font-semibold ${
                        isStudent && eligibility?.criteria?.find(c => c.field === 'cgpa')?.passed === false
                          ? 'text-rose-400'
                          : 'text-indigo-400'
                      }`}>
                        CGPA: {drive.minimumCGPA}+
                      </span>
                      <span className="text-slate-500 mx-1">•</span>
                      <span className={
                        isStudent && eligibility?.criteria?.find(c => c.field === 'backlogs')?.passed === false
                          ? 'text-rose-400'
                          : ''
                      }>
                        Backlogs: {drive.maximumBacklogs}
                      </span>
                      <span className="text-slate-500 mx-1">•</span>
                      <span className={`font-semibold ${
                        isStudent && eligibility?.criteria?.find(c => c.field === 'graduationYear')?.passed === false
                          ? 'text-rose-400'
                          : 'text-violet-400'
                      }`}>
                        {drive.graduationYear}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate max-w-[200px] ${
                      isStudent && eligibility?.criteria?.find(c => c.field === 'department')?.passed === false
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}>
                      {Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments.length > 0
                        ? `${drive.eligibleDepartments.length} depts: ${drive.eligibleDepartments[0]}`
                        : 'All depts'}
                    </div>
                  </td>

                  {/* Status / Eligibility pill — student only column */}
                  {isStudent && (
                    <td className="py-4 px-6">
                      {hasApplied ? (
                        <Link
                          to="/applications"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2.5 py-0.5 rounded-full hover:bg-sky-500/20 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3 text-sky-400" />
                          <span>Applied ({application.status})</span>
                        </Link>
                      ) : (
                        <EligibilityPill eligibility={eligibility} />
                      )}
                    </td>
                  )}

                  {/* Drive Date & Deadline */}
                  <td className="py-4 px-6 text-xs">
                    <div className="flex items-center gap-1 text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{drive.driveDate ? new Date(drive.driveDate).toLocaleDateString() : 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Apply by: {drive.applicationDeadline ? new Date(drive.applicationDeadline).toLocaleDateString() : 'Open'}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(drive.status)}`}>
                      {drive.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isStudent && canApply && (
                        <button
                          onClick={() => onApply ? onApply(drive) : onView(drive)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          Apply
                        </button>
                      )}
                      <button
                        id={`drive-table-view-btn-${drive._id}`}
                        onClick={() => onView(drive)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <>
                          <button
                            id={`drive-table-edit-btn-${drive._id}`}
                            onClick={() => onEdit(drive)}
                            className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/10 transition-colors"
                            title="Edit Drive"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`drive-table-delete-btn-${drive._id}`}
                            onClick={() => onDelete(drive)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                            title="Delete Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriveTableView;
