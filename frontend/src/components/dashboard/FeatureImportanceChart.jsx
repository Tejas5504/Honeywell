import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CHART_PALETTE, CHART_TOOLTIP_STYLE } from '../../utils/constants';

const FEATURE_LABELS = {
  hour_of_day: 'Hour of Day (0-23)',
  day_of_week: 'Day of Week (Mon-Sun)',
  session_duration_normalized: 'Session Duration Z-Score',
  is_new_device: 'Unrecognized Device Fingerprint',
  is_new_location: 'Unrecognized Country / City',
  is_new_resource: 'Resource Novelty Index',
  auth_method_encoded: 'Authentication Protocol',
  command_count: 'Privileged Command Count',
  has_suspicious_commands: 'Suspicious Command Flag',
  is_outside_normal_hours: 'Off-Hours Work Deviation',
  resource_sensitivity: 'Sensitive Endpoint Flag'
};

const FeatureImportanceChart = ({ featureImportances = {} }) => {
  const chartData = Object.entries(featureImportances)
    .map(([key, val]) => ({
      feature: FEATURE_LABELS[key] || key,
      importance: typeof val === 'number' ? Number((val * 100).toFixed(2)) : 0
    }))
    .sort((a, b) => b.importance - a.importance);

  if (!chartData.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No feature importances computed yet. Train the model to view feature weights.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 30, left: 140, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" horizontal={false} />
          <XAxis
            type="number"
            stroke="#4b5563"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="feature"
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value) => [`${value}%`, 'Feature Weight']}
          />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeatureImportanceChart;
