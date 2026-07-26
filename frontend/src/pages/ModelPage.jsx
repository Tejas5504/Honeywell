import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { HiOutlineCpuChip, HiOutlinePlay, HiOutlineArrowPath, HiOutlineChartBar } from 'react-icons/hi2';
import { modelAPI } from '../api/client';
import { useApi } from '../hooks/useApi';
import ConfusionMatrix from '../components/model/ConfusionMatrix';
import FeatureImportanceChart from '../components/dashboard/FeatureImportanceChart';
import { SkeletonCard } from '../components/shared/Skeleton';
import { formatDateTime, formatPercentage } from '../utils/formatters';

export default function ModelPage() {
  const { data: metrics, loading: loadingMetrics, refresh: refreshMetrics } = useApi(modelAPI.getMetrics, true);
  const [training, setTraining] = useState(false);
  const [predicting, setPredicting] = useState(false);

  const handleTrain = async () => {
    setTraining(true);
    try {
      const res = await modelAPI.trainModel();
      toast.success(res.message || 'Model trained successfully!');
      refreshMetrics();
    } catch (err) {
      toast.error(err.message || 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await modelAPI.runPrediction();
      toast.success(res.message || `Processed ${res.total_processed} logs, created ${res.alerts_created} alerts`);
    } catch (err) {
      toast.error(err.message || 'Prediction job failed');
    } finally {
      setPredicting(false);
    }
  };

  // Parse confusion matrix [[TN, FP], [FN, TP]]
  const cm = metrics?.confusion_matrix;
  const cmData = cm && cm.length === 2 ? {
    tn: cm[0][0],
    fp: cm[0][1],
    fn: cm[1][0],
    tp: cm[1][1]
  } : { tn: 0, fp: 0, fn: 0, tp: 0 };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Model Management</h1>
          <p className="text-gray-400 mt-1">Train Isolation Forest and neural network models for behavioral anomaly detection.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePredict}
            disabled={predicting}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              predicting ? 'bg-accent-cyan/50 text-white/50 cursor-not-allowed' : 'bg-accent-cyan text-navy-950 hover:bg-cyan-400'
            }`}
          >
            {predicting ? <HiOutlineArrowPath className="w-5 h-5 animate-spin" /> : <HiOutlinePlay className="w-5 h-5" />}
            Run Inference Job
          </button>
          <button
            onClick={handleTrain}
            disabled={training}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              training ? 'bg-accent-purple/50 text-white/50 cursor-not-allowed' : 'bg-accent-purple text-white hover:bg-purple-600'
            }`}
          >
            {training ? <HiOutlineArrowPath className="w-5 h-5 animate-spin" /> : <HiOutlineCpuChip className="w-5 h-5" />}
            Retrain Model
          </button>
        </div>
      </div>

      {loadingMetrics && !metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard height="120px" />
          <SkeletonCard height="120px" />
          <SkeletonCard height="120px" />
          <SkeletonCard height="120px" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 rounded-xl border border-white/10 border-t-4 border-t-accent-blue">
              <p className="text-sm text-gray-400 mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-white">{formatPercentage(metrics?.accuracy)}</p>
            </div>
            <div className="glass-card p-6 rounded-xl border border-white/10 border-t-4 border-t-accent-emerald">
              <p className="text-sm text-gray-400 mb-1">Precision</p>
              <p className="text-3xl font-bold text-white">{formatPercentage(metrics?.precision)}</p>
            </div>
            <div className="glass-card p-6 rounded-xl border border-white/10 border-t-4 border-t-accent-amber">
              <p className="text-sm text-gray-400 mb-1">Recall</p>
              <p className="text-3xl font-bold text-white">{formatPercentage(metrics?.recall)}</p>
            </div>
            <div className="glass-card p-6 rounded-xl border border-white/10 border-t-4 border-t-accent-purple">
              <p className="text-sm text-gray-400 mb-1">F1 Score</p>
              <p className="text-3xl font-bold text-white">{formatPercentage(metrics?.f1_score)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <HiOutlineChartBar className="text-accent-blue w-5 h-5" />
                Confusion Matrix
              </h2>
              <div className="h-[360px]">
                <ConfusionMatrix data={cmData} />
              </div>
            </div>

            <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Model Information</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">Architecture</span>
                    <span className="text-white">Isolation Forest ensemble</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">Last Trained</span>
                    <span className="text-white text-sm">{metrics?.trained_at ? formatDateTime(metrics.trained_at) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-400">Training Samples</span>
                    <span className="text-white">{metrics?.training_samples?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {metrics?.hyperparameters && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Hyperparameters</h3>
                  <div className="bg-navy-900/50 rounded-lg p-4 font-mono text-xs text-accent-cyan overflow-x-auto">
                    <pre>{JSON.stringify(metrics.hyperparameters, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Permutation Feature Importance Chart */}
          <div className="glass-card rounded-xl border border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiOutlineCpuChip className="text-accent-purple w-5 h-5" />
              Permutation Feature Importances (Explainable AI Signal Attribution)
            </h2>
            <FeatureImportanceChart featureImportances={metrics?.feature_importances} />
          </div>
        </>
      )}
    </div>
  );
}
