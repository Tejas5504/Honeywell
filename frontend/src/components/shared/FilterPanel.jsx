import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineFunnel, HiXMark } from 'react-icons/hi2';
import { ATTACK_TYPES } from '../../utils/constants';

const FilterPanel = ({ isOpen, onClose, onApply }) => {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    attackTypes: [],
    minRiskScore: 0,
    status: '',
    country: ''
  });

  const handleAttackTypeToggle = (type) => {
    setFilters(prev => ({
      ...prev,
      attackTypes: prev.attackTypes.includes(type)
        ? prev.attackTypes.filter(t => t !== type)
        : [...prev.attackTypes, type]
    }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleClear = () => {
    const emptyFilters = {
      dateRange: { start: '', end: '' },
      attackTypes: [],
      minRiskScore: 0,
      status: '',
      country: ''
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden glass-card mb-6"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <HiOutlineFunnel className="text-accent-cyan" />
                Advanced Filters
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, start: e.target.value}})}
                    className="w-full bg-navy-800 border border-glass-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-blue"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({...filters, dateRange: {...filters.dateRange, end: e.target.value}})}
                    className="w-full bg-navy-800 border border-glass-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              {/* Min Risk Score */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Min Risk Score: {filters.minRiskScore}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minRiskScore}
                  onChange={(e) => setFilters({...filters, minRiskScore: Number(e.target.value)})}
                  className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full bg-navy-800 border border-glass-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-blue"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Country</label>
                <input
                  type="text"
                  placeholder="e.g. US, CN, RU"
                  value={filters.country}
                  onChange={(e) => setFilters({...filters, country: e.target.value})}
                  className="w-full bg-navy-800 border border-glass-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent-blue"
                />
              </div>
            </div>

            {/* Attack Types */}
            <div className="mt-6">
              <label className="block text-sm text-gray-400 mb-2">Attack Types</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ATTACK_TYPES).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleAttackTypeToggle(key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      filters.attackTypes.includes(key)
                        ? 'bg-accent-blue/20 text-accent-cyan border-accent-blue/50'
                        : 'bg-navy-800 text-gray-400 border-glass-border hover:bg-navy-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-glass-border pt-4">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium bg-accent-blue hover:bg-accent-blue/80 text-white rounded-md transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilterPanel;
