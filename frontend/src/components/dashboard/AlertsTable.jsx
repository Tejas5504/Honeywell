import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../shared/Badge';
import { formatDateTime, truncateText } from '../../utils/formatters';
import { ATTACK_TYPES } from '../../utils/constants';

const AlertsTable = ({ alerts = [], isLoading }) => {
  const navigate = useNavigate();
  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-10 bg-navy-800 rounded"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-navy-800/50 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (safeAlerts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No alerts found. Generate data and run predictions first.
      </div>
    );
  }

  const getRiskColor = (score) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 25) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getSeverity = (score) => {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="text-xs uppercase bg-navy-900 text-gray-400 border-b border-glass-border">
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">Entity</th>
            <th scope="col" className="px-6 py-4 font-medium">Risk Score</th>
            <th scope="col" className="px-6 py-4 font-medium">Detection Type</th>
            <th scope="col" className="px-6 py-4 font-medium">Location</th>
            <th scope="col" className="px-6 py-4 font-medium">Status</th>
            <th scope="col" className="px-6 py-4 font-medium text-right">Time Detected</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-glass-border">
          {safeAlerts.map((alert) => {
            const id = alert.id || alert._id;
            const entityName = alert.entityName || alert.entity_id || 'Unknown';
            const entityType = alert.entityType || alert.entity_type || '';
            const riskScore = alert.riskScore ?? alert.risk_score ?? 0;
            const attackType = alert.attackType || alert.attack_type || 'unknown';
            const severity = alert.severity || getSeverity(riskScore);
            const status = alert.status || 'new';
            const location = alert.location ||
              (alert.geo_location ? `${alert.geo_location.city || ''}, ${alert.geo_location.country || ''}` : 'Unknown');
            const timestamp = alert.timestamp;

            return (
              <tr
                key={id || Math.random()}
                onClick={() => navigate(`/alerts/${id}`)}
                className="bg-navy-950 table-row-hover group cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-white font-medium mr-3">
                      {entityName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium group-hover:text-accent-cyan transition-colors">{entityName}</div>
                      <div className="text-xs">{entityType}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`font-bold ${riskScore >= 75 ? 'text-red-500' : 'text-white'}`}>
                      {riskScore}
                    </span>
                    <div className="w-24 h-1.5 bg-navy-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getRiskColor(riskScore)}`}
                        style={{ width: `${riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={severity} type="severity">
                    {ATTACK_TYPES[attackType] || attackType}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                    {truncateText(location, 20)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={status} type="status">
                    {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap text-gray-500">
                  {formatDateTime(timestamp)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AlertsTable;
