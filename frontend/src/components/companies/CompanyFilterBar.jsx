import React from 'react';
import { Search, X, Filter, LayoutGrid, List, RotateCcw } from 'lucide-react';

const CompanyFilterBar = ({
  search,
  setSearch,
  selectedIndustry,
  setSelectedIndustry,
  industries,
  viewMode,
  setViewMode,
  totalCount,
  filteredCount,
  onReset,
}) => {
  const isFiltered = search.trim() !== '' || selectedIndustry !== 'All';

  return (
    <div className="bg-white border border-[#E4E8EF] rounded-xl p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
            <Search size={16} strokeWidth={1.8} />
          </div>
          <input
            id="company-search-input"
            type="text"
            placeholder="Search by company name, location, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-[#F5F7FA] border border-[#E4E8EF] rounded-lg text-xs sm:text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:bg-white transition-all"
          />
          {search && (
            <button
              id="company-search-clear-btn"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#202B3C]"
            >
              <X size={15} strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* Right controls: Industry filter & View toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Industry select dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-[#94A3B8]">
              <Filter size={14} strokeWidth={1.8} />
            </div>
            <select
              id="company-industry-select"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="pl-8 pr-8 py-2 bg-white border border-[#E4E8EF] rounded-lg text-xs font-medium text-[#202B3C] hover:border-[#CBD5E1] focus:outline-none focus:border-[#3569A8] transition-colors cursor-pointer"
            >
              <option value="All">All Industries ({totalCount})</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              id="company-filter-reset-btn"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#202B3C] text-xs font-medium transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={13} strokeWidth={1.8} />
              <span>Reset</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-[#F5F7FA] border border-[#E4E8EF] rounded-lg">
            <button
              id="company-view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#19365C] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#202B3C]'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} strokeWidth={1.8} />
            </button>
            <button
              id="company-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#19365C] shadow-xs font-semibold'
                  : 'text-[#667085] hover:text-[#202B3C]'
              }`}
              title="Table View"
            >
              <List size={15} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter status row */}
      {isFiltered && (
        <div className="mt-3 pt-3 border-t border-[#E4E8EF] flex items-center justify-between text-xs text-[#667085]">
          <span>
            Showing <strong className="text-[#202B3C]">{filteredCount}</strong> of <strong className="text-[#202B3C]">{totalCount}</strong> partner organizations
          </span>
          <button
            onClick={onReset}
            className="text-[#3569A8] hover:underline font-medium"
          >
            Clear active filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyFilterBar;
