import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel } from 'react-icons/hi2';
import { alertsAPI } from '../api/client';
import { useApi } from '../hooks/useApi';
import AlertsTable from '../components/dashboard/AlertsTable';
import FilterPanel from '../components/shared/FilterPanel';
import Pagination from '../components/shared/Pagination';
import { SkeletonTable } from '../components/shared/Skeleton';

export default function AlertsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  const { data, loading, error, execute } = useApi(alertsAPI.getAlerts, false);

  useEffect(() => {
    execute({
      page,
      page_size: pageSize,
      search: searchQuery,
      ...filters
    });
  }, [page, pageSize, searchQuery, filters, execute]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Alerts</h1>
          <p className="text-gray-400 mt-1">Review and investigate potential security threats.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search user, IP, or device..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-navy-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center p-2 border rounded-lg transition-colors ${
              showFilters || Object.keys(filters).length > 0
                ? 'bg-accent-blue/10 border-accent-blue text-accent-blue'
                : 'bg-navy-900 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            <HiOutlineFunnel className="w-5 h-5" />
          </button>
        </div>
      </div>

      <FilterPanel 
        isOpen={showFilters} 
        onApply={handleApplyFilters} 
        initialFilters={filters}
      />

      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        {loading && !data ? (
          <div className="p-6">
            <SkeletonTable rows={10} columns={6} />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-accent-red">
            <p>Failed to load alerts: {error.message}</p>
            <button 
              onClick={() => execute({ page, page_size: pageSize, search: searchQuery, ...filters })}
              className="mt-4 px-4 py-2 bg-white/5 rounded hover:bg-white/10"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <AlertsTable alerts={data?.alerts || []} />
            {data && data.alerts.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No alerts found matching your criteria.
              </div>
            )}
            
            {data && data.total > 0 && (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.total_pages}
                  pageSize={pageSize}
                  totalItems={data.total}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
