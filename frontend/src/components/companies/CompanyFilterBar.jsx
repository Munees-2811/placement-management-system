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
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-5 mb-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="company-search-input"
            type="text"
            placeholder="Search by company name, location, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {search && (
            <button
              id="company-search-clear-btn"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right controls: Industry filter & View toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Industry select dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-slate-500">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <select
              id="company-industry-select"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="pl-8 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-slate-300 hover:text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            <button
              id="company-view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="company-view-table-btn"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter summary status */}
      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-semibold text-white">{filteredCount}</span> of{' '}
          <span className="font-semibold text-white">{totalCount}</span> partner companies
          {isFiltered && <span className="text-indigo-400 ml-1">(filtered)</span>}
        </div>
      </div>
    </div>
  );
};

export default CompanyFilterBar;
