import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange 
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Show limited pages with ellipsis if too many
  let displayPages = pages;
  if (totalPages > 7) {
    if (currentPage <= 4) {
      displayPages = [...pages.slice(0, 5), '...', totalPages];
    } else if (currentPage >= totalPages - 3) {
      displayPages = [1, '...', ...pages.slice(totalPages - 5)];
    } else {
      displayPages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-glass-border">
      <div className="flex items-center text-sm text-gray-400">
        <span className="mr-2">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-navy-800 border border-glass-border rounded-md px-2 py-1 focus:outline-none focus:border-accent-blue"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex flex-1 justify-end">
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Previous</span>
            <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          
          {displayPages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? onPageChange(page) : null}
              disabled={page === '...'}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                page === currentPage
                  ? 'z-10 bg-accent-blue/20 text-accent-cyan border border-accent-blue/30'
                  : 'text-gray-300 hover:bg-white/5 border border-transparent'
              } ${page === '...' ? 'cursor-default' : ''}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="sr-only">Next</span>
            <HiChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
