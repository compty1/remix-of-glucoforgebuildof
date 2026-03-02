/**
 * Domain 1.1: Web Worker for glucose forecasting
 * Runs Holt-Winters math off the main thread.
 */
import { holtWintersForecast, type GlucoseReading } from '../utils/timeSeriesForecaster';

export interface ForecastWorkerRequest {
  readings: GlucoseReading[];
  horizonHours: number;
  intervalMinutes?: number;
}

self.onmessage = (event: MessageEvent<ForecastWorkerRequest>) => {
  const { readings, horizonHours, intervalMinutes = 5 } = event.data;

  try {
    const result = holtWintersForecast(readings, horizonHours, intervalMinutes);
    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Forecast failed',
    });
  }
};
