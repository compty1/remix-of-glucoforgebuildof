/**
 * Domain 1.1: Hook for client-side glucose forecasting via Web Worker.
 * Bugs 266-267: Reuses worker via ref, terminates on unmount.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import type { GlucoseReading, ForecastResult } from '@/utils/timeSeriesForecaster';

export function useGlucoseForecast(
  readings: GlucoseReading[],
  horizonHours = 2
) {
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const mountedRef = useRef(true);

  // Terminate worker on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const runForecast = useCallback(() => {
    if (readings.length < 12) {
      setForecast(null);
      return;
    }

    // Terminate any existing worker before creating a new one
    workerRef.current?.terminate();

    setLoading(true);
    setError(null);

    try {
      const worker = new Worker(
        new URL('../workers/glucoseForecast.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      worker.onmessage = (event) => {
        if (!mountedRef.current) return;
        if (event.data.success) {
          setForecast(event.data.result);
        } else {
          setError(event.data.error);
        }
        setLoading(false);
        worker.terminate();
        if (workerRef.current === worker) workerRef.current = null;
      };

      worker.onerror = () => {
        if (!mountedRef.current) return;
        setError('Forecast worker failed');
        setLoading(false);
        worker.terminate();
        if (workerRef.current === worker) workerRef.current = null;
      };

      worker.postMessage({ readings, horizonHours });
    } catch {
      setError('Could not start forecast worker');
      setLoading(false);
    }
  }, [readings, horizonHours]);

  return { forecast, loading, error, refresh: runForecast };
}
