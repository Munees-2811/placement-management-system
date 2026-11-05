import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const PageHeader = ({
  title,
  subtitle,
  actions = null,
  breadcrumb = [],
}) => {
  return (
    <div className="mb-6 pb-5 border-b border-[#E4E8EF]">
      {/* Breadcrumbs */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[#667085] mb-2.5">
          {breadcrumb.map((crumb, idx) => (
            <React.Fragment key={crumb.label + idx}>
              {idx > 0 && (
                <ChevronRight size={13} strokeWidth={1.8} className="text-[#94A3B8] shrink-0" />
              )}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-[#19365C] transition-colors truncate max-w-[150px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#202B3C] font-medium truncate max-w-[180px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202B3C] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#667085] mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons Slot */}
        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
