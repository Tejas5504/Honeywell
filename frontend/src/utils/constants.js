/**
 * Application-wide constants for colors, labels, and chart configuration.
 */

export const COLORS = {
  primary: '#06b6d4',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
  dark: '#050816',
  light: '#f8fafc',
};

export const SEVERITY_COLORS = {
  critical: 'text-red-500 bg-red-500/10 border-red-500/20',
  high: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
};

export const STATUS_COLORS = {
  new: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  investigating: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  resolved: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  false_positive: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
};

// Must match backend AttackType enum values
export const ATTACK_TYPES = {
  brute_force: 'Brute Force',
  impossible_travel: 'Impossible Travel',
  credential_stuffing: 'Credential Stuffing',
  device_spoofing: 'Device Spoofing',
  lateral_movement: 'Lateral Movement',
  low_and_slow_exfiltration: 'Low-and-Slow Exfiltration',
  insider_drift: 'Insider Drift',
  unknown: 'Unknown',
};

export const CHART_PALETTE = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#f97316'];

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#0f1425',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  color: '#fff',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
};
