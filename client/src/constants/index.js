// src/constants/index.js - App-wide constants

export const APP_NAME = 'CivicSense AI';
export const APP_TAGLINE = 'Data-Driven Decisions for Future-Ready Constituencies';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const CATEGORIES = [
  { id: 'roads', label: 'Roads & Infrastructure', color: '#3b82f6', emoji: '🛣️' },
  { id: 'water', label: 'Water Supply', color: '#06b6d4', emoji: '💧' },
  { id: 'health', label: 'Healthcare', color: '#ef4444', emoji: '🏥' },
  { id: 'education', label: 'Education', color: '#8b5cf6', emoji: '🎓' },
  { id: 'electricity', label: 'Electricity', color: '#f59e0b', emoji: '⚡' },
  { id: 'sanitation', label: 'Sanitation', color: '#10b981', emoji: '🧹' },
  { id: 'other', label: 'Other', color: '#6b7280', emoji: '📋' },
];

export const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  analyzed: 'Analyzed',
  resolved: 'Resolved',
};

export const PRIORITY_THRESHOLDS = {
  critical: 90,
  high: 70,
  medium: 50,
  low: 0,
};

export const PRIORITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

export const MAP_CENTER = [12.9716, 77.5946]; // Bangalore default
export const MAP_ZOOM = 13;

export const ANIMATION_VARIANTS = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
};
