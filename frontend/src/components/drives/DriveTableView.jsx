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
import StatusBadge from '../common/StatusBadge';

/**
 * Compact eligibility pill for table rows (student only)
 */
const EligibilityPill = ({ eligibility }) => {
  if (!eligibility) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#667085] border border-[#E2E8F0]">
        <Info className="w-3 h-3" />
        Checking…
      </span>
    );
  }

  if (eligibility.profileIncomplete) {
    return (
      <span
        id="table-eligibility-incomplete"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-[#C58A25] border border-amber-200"
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
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#16845B] border border-emerald-200"
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
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-[#D14343] border border-red-200"
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
    <div className="bg-white border border-[#E4E8EF] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#202B3C]">
          <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#667085] border-b border-[#E4E8EF]">
            <tr>
              <th className="py-3.5 px-6 font-semibold">Job Role &amp; Company</th>
              <th className="py-3.5 px-6 font-semibold">Package (CTC)</th>
              <th className="py-3.5 px-6 font-semibold">Eligibility Criteria</th>
              {isStudent && <th className="py-3.5 px-6 font-semibold">Your Status</th>}
              <th className="py-3.5 px-6 font-semibold">Drive Date</th>
              <th className="py-3.5 px-6 font-semibold">Status</th>
              <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF]">
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
                  className="hover:bg-[#F8FAFC] transition-colors"
                >
                  {/* Job Role and Company */}
                  <td className="py-4 px-6">
                    <div>
                      <button
                        onClick={() => onView(drive)}
                        className="font-bold text-[#202B3C] hover:text-[#3569A8] text-left transition-colors truncate max-w-[220px] block"
                      >
                        {drive.jobRole}
                      </button>
                      <div className="flex items-center gap-1.5 text-xs text-[#667085] mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#3569A8]" />
                        <span className="truncate max-w-[180px]">{companyName}</span>
                      </div>
                    </div>
                  </td>

                  {/* Salary Package */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-[#16845B] border border-emerald-200 whitespace-nowrap">
                      <DollarSign className="w-3 h-3" />
                      {drive.salaryPackage}
                    </span>
                  </td>

                  {/* Academic Criteria */}
                  <td className="py-4 px-6 text-xs">
                    <div>
                      <span className={`font-semibold ${
                        isStudent && eligibility?.criteria?.find(c => c.field === 'cgpa')?.passed === false
                          ? 'text-[#D14343]'
                          : 'text-[#19365C]'
                      }`}>
                        CGPA: {drive.minimumCGPA}+
                      </span>
                      <span className="text-[#94A3B8] mx-1">•</span>
                      <span className={
                        isStudent && eligibility?.criteria?.find(c => c.field === 'backlogs')?.passed === false
                          ? 'text-[#D14343]'
                          : 'text-[#202B3C]'
                      }>
                        Backlogs: {drive.maximumBacklogs}
                      </span>
                      <span className="text-[#94A3B8] mx-1">•</span>
                      <span className={`font-semibold ${
                        isStudent && eligibility?.criteria?.find(c => c.field === 'graduationYear')?.passed === false
                          ? 'text-[#D14343]'
                          : 'text-[#3569A8]'
                      }`}>
                        {drive.graduationYear}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-0.5 truncate max-w-[200px] ${
                      isStudent && eligibility?.criteria?.find(c => c.field === 'department')?.passed === false
                        ? 'text-[#D14343]'
                        : 'text-[#667085]'
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
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E40AF] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#3569A8]" />
                          <span>Applied ({application.status})</span>
                        </Link>
                      ) : (
                        <EligibilityPill eligibility={eligibility} />
                      )}
                    </td>
                  )}

                  {/* Drive Date & Deadline */}
                  <td className="py-4 px-6 text-xs">
                    <div className="flex items-center gap-1 text-[#202B3C]">
                      <Calendar className="w-3.5 h-3.5 text-[#3569A8]" />
                      <span>{drive.driveDate ? new Date(drive.driveDate).toLocaleDateString() : 'TBA'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#667085] text-[11px] mt-0.5">
                      <Clock className="w-3 h-3 text-[#C58A25]" />
                      <span>Apply by: {drive.applicationDeadline ? new Date(drive.applicationDeadline).toLocaleDateString() : 'Open'}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    <StatusBadge status={drive.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isStudent && canApply && (
                        <button
                          onClick={() => onApply ? onApply(drive) : onView(drive)}
                          className="px-2.5 py-1 rounded-lg bg-[#16845B] hover:bg-[#126848] text-white text-xs font-semibold transition-colors"
                        >
                          Apply
                        </button>
                      )}
                      <button
                        id={`drive-table-view-btn-${drive._id}`}
                        onClick={() => onView(drive)}
                        className="p-1.5 rounded-lg text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canManage && (
                        <>
                          <button
                            id={`drive-table-edit-btn-${drive._id}`}
                            onClick={() => onEdit(drive)}
                            className="p-1.5 rounded-lg text-[#3569A8] hover:text-[#19365C] hover:bg-[#EFF6FF] transition-colors"
                            title="Edit Drive"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`drive-table-delete-btn-${drive._id}`}
                            onClick={() => onDelete(drive)}
                            className="p-1.5 rounded-lg text-[#D14343] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
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
