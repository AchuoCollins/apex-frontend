import { useContext } from 'react';
import { MetricsContext } from '../context/MetricsContext';

export function useMetrics() {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error('useMetrics must be used within MetricsProvider');
  return ctx;
}
