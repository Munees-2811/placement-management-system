import React from 'react';
import { Edit3, Award, BookOpen, Calendar, Phone, AlertTriangle, UserCheck } from 'lucide-react';

const AcademicStatsCard = ({ profile, onEdit }) => {
  const cgpa = profile?.cgpa !== null && profile?.cgpa !== undefined
    ? Number(profile.cgpa).toFixed(2)
    : null;

  const getCgpaStatus = (val) => {
    if (!val) return { label: 'Not set', badgeClass: 'bg-[#F1F5F9] text-[#667085] border border-[#E2E8F0]' };
    const n = Number(val);
    if (n >= 9.0) return { label: 'Outstanding', badgeClass: 'bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0]' };
    if (n >= 8.0) return { label: 'Distinction', badgeClass: 'bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]' };
    if (n >= 7.0) return { label: 'First Class', badgeClass: 'bg-[#F0FDFA] text-[#0D9488] border border-[#99F6E4]' };
    if (n >= 6.0) return { label: 'Second Class', badgeClass: 'bg-[#FEFCE8] text-[#C58A25] border border-[#FEF08A]' };
    return { label: 'Eligible', badgeClass: 'bg-[#F1F5F9] text-[#667085] border border-[#E2E8F0]' };
  };

  const backlogs = profile?.backlogs ?? 0;
  const cgpaStatus = getCgpaStatus(cgpa);

  return (
    <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E4E8EF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-[#202B3C]">Academic Credentials</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
                Verified Record
              </span>
            </div>
            <p className="text-xs text-[#667085]">Placement eligibility and university academic metrics</p>
          </div>
          <button
            onClick={onEdit}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <Edit3 size={13} strokeWidth={1.8} className="text-[#3569A8]" />
            <span>Edit Details</span>
          </button>
        </div>

        {/* Top Stat Tiles: CGPA and Backlogs */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* CGPA */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-1">
                <Award size={14} strokeWidth={1.8} className="text-[#C58A25]" />
                <span>CGPA</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#202B3C] tracking-tight">
                  {cgpa || '—'}
                </span>
                <span className="text-xs text-[#667085] font-medium">/ 10.0</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cgpaStatus.badgeClass}`}>
                {cgpaStatus.label}
              </span>
            </div>
          </div>

          {/* Backlogs */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-1">
                <AlertTriangle
                  size={14}
                  strokeWidth={1.8}
                  className={backlogs === 0 ? 'text-[#16845B]' : backlogs <= 2 ? 'text-[#C58A25]' : 'text-[#D14343]'}
                />
                <span>Backlogs</span>
              </div>
              <div className="text-2xl font-bold tracking-tight">
                <span className={backlogs === 0 ? 'text-[#16845B]' : backlogs <= 2 ? 'text-[#C58A25]' : 'text-[#D14343]'}>
                  {backlogs}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                backlogs === 0
                  ? 'bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0]'
                  : backlogs <= 2
                  ? 'bg-[#FEFCE8] text-[#C58A25] border border-[#FEF08A]'
                  : 'bg-[#FEF2F2] text-[#D14343] border border-[#FECACA]'
              }`}>
                {backlogs === 0 ? 'Clear' : 'Active arrears'}
              </span>
            </div>
          </div>
        </div>

        {/* Academic & Contact Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF]">
          {/* Department */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-1">
              <BookOpen size={13} strokeWidth={1.8} className="text-[#3569A8] shrink-0" />
              <span>Department</span>
            </div>
            <p className="text-xs font-semibold text-[#202B3C] truncate leading-normal" title={profile?.department}>
              {profile?.department || <span className="text-[#94A3B8] font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* Batch / Year */}
          <div className="min-w-0 sm:border-l sm:border-[#E4E8EF] sm:pl-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-1">
              <Calendar size={13} strokeWidth={1.8} className="text-[#3569A8] shrink-0" />
              <span>Batch / Year</span>
            </div>
            <p className="text-xs font-semibold text-[#202B3C] truncate leading-normal">
              {profile?.batch ? `Batch ${profile.batch}` : <span className="text-[#94A3B8] font-normal italic">Not specified</span>}
            </p>
          </div>

          {/* Contact Phone */}
          <div className="min-w-0 sm:border-l sm:border-[#E4E8EF] sm:pl-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#667085] uppercase tracking-wider mb-1">
              <Phone size={13} strokeWidth={1.8} className="text-[#16845B] shrink-0" />
              <span>Phone</span>
            </div>
            <p className="text-xs font-semibold font-mono text-[#202B3C] truncate leading-normal" title={profile?.phone}>
              {profile?.phone || <span className="text-[#94A3B8] font-normal italic font-sans">Not specified</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Bio / Profile Objective statement if present */}
      {profile?.bio && (
        <div className="mt-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E4E8EF] flex items-start gap-2.5">
          <UserCheck size={14} strokeWidth={1.8} className="text-[#3569A8] shrink-0 mt-0.5" />
          <p className="text-xs text-[#475569] leading-relaxed line-clamp-2" title={profile.bio}>
            {profile.bio}
          </p>
        </div>
      )}
    </div>
  );
};

export default AcademicStatsCard;
