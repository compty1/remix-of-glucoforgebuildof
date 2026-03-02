/**
 * Domain 1.1: Hook for client-side glucose forecasting via Web Worker.
 */
import { useState, useEffect, useCallback } from 'react';
import type { GlucoseReading, ForecastResult } from '@/utils/timeSeriesForecaster';

export function useGlucoseForecast(
  readings: GlucoseReading[],
  horizonHours = 2
) {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runForecast = useCallback(() => {
    if (readings.length < 12) {
      setForecast(null);
      return;
    }

    setLoading(true);
    setError(null);

    const worker = new Worker(
      new URL('../workers/glucoseForecast.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (event) => {
      if (event.data.success) {
        setForecast(event.data.result);
      } else {
        setError(event.data.error);
      }
      setLoading(false);
      worker.terminate();
    };

    worker.onerror = () => {
      setError('Forecast worker failed');
      setLoading(false);
      worker.terminate();
    };

    worker.postMessage({ readings, horizonHours });
  }, [readings, horizonHours]);

  useEffect(() => {
    runForecast();
  }, [runForecast]);

  return { forecast, loading, error, refresh: runForecast };
}
