/**
 * ReportPage - Generate and download PDF security reports.
 * Allows configuring which sections to include and downloads
 * the generated PDF from the backend.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineDocumentArrowDown,
  HiOutlineDocumentText,
  HiOutlineCog6Tooth,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import { reportsAPI } from '../api/client';

const REPORT_SECTIONS = [
  { key: 'include_threats', label: 'Threat Summary', description: 'Overview of detected threats and severity breakdown' },
  { key: 'include_attacks', label: 'Detected Attacks', description: 'Breakdown of attack types and frequencies' },
  { key: 'include_risk_distribution', label: 'Risk Distribution', description: 'Risk score histogram and severity analysis' },
  { key: 'include_model_performance', label: 'Model Performance', description: 'Isolation Forest accuracy, precision, recall, F1' },
  { key: 'include_recommendations', label: 'Recommendations', description: 'Security recommendations based on findings' },
];

const ReportPage = () => {
  const [config, setConfig] = useState(
    Object.fromEntries(REPORT_SECTIONS.map(s => [s.key, true]))
  );
  const [generating, setGenerating] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const toggleSection = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setReportId(null);
    try {
      const result = await reportsAPI.generateReport(config);
      setReportId(result.report_id);
      toast.success('Report generated successfully!');
    } catch (err) {
      toast.error('Failed to generate report');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!reportId) return;
    setDownloading(true);
    try {
      const response = await reportsAPI.downloadReport(reportId);
      // Create download link from blob
      const url = window.URL.createObjectURL(new Blob([response]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `CyberShield_Report_${reportId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Report downloaded!');
    } catch (err) {
      toast.error('Failed to download report');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-accent-amber/10 rounded-lg text-accent-amber">
          <HiOutlineDocumentText className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Security Reports</h1>
          <p className="text-gray-400 text-sm mt-1">
            Generate downloadable PDF reports with threat analysis and recommendations
          </p>
        </div>
      </div>

      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Report Sections</h2>

        <div className="space-y-3">
          {REPORT_SECTIONS.map(section => (
            <label
              key={section.key}
              className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                config[section.key]
                  ? 'bg-navy-800 border-accent-blue/50'
                  : 'bg-navy-900 border-glass-border hover:bg-navy-800'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
                config[section.key] ? 'bg-accent-blue border-accent-blue' : 'border-gray-500'
              }`}>
                {config[section.key] && <span className="text-white text-xs">✓</span>}
              </div>
              <div>
                <div className={config[section.key] ? 'text-white font-medium' : 'text-gray-400'}>
                  {section.label}
                </div>
                <div className="text-gray-500 text-sm">{section.description}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Generate Button */}
        <div className="pt-6 mt-6 border-t border-glass-border flex flex-col items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={generating || !Object.values(config).some(Boolean)}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
              generating
                ? 'bg-navy-800 text-gray-400 cursor-wait'
                : 'bg-accent-blue text-white hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
            }`}
          >
            {generating ? (
              <>
                <HiOutlineCog6Tooth className="w-6 h-6 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <HiOutlineDocumentArrowDown className="w-6 h-6" />
                Generate PDF Report
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Result / Download */}
      {reportId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-l-4 border-l-emerald-500"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HiOutlineCheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <div className="text-white font-semibold">Report Ready</div>
                <div className="text-gray-400 text-sm">
                  Report ID: {reportId.slice(0, 8)}...
                </div>
              </div>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors font-semibold"
            >
              <HiOutlineDocumentArrowDown className="w-5 h-5" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportPage;
