/**
 * Domain 1.1: Holt-Winters Triple Exponential Smoothing
 * Client-side deterministic glucose forecasting (no LLM dependency).
 * Handles daily seasonality (288 readings/day at 5-min intervals).
 */

export interface GlucoseReading {
  timestamp: number; // epoch ms
  value: number;     // mg/dL
}

export interface ForecastPoint {
  timestamp: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
}

export interface ForecastResult {
  predictions: ForecastPoint[];
  modelFit: { mape: number; rmse: number };
}

/**
 * Holt-Winters additive model with daily seasonality.
 * @param readings - sorted ascending by timestamp, ideally 48-72h of 5-min data
 * @param horizonHours - how many hours ahead to forecast (1-4)
 * @param intervalMinutes - expected interval between readings (default 5)
 */
export function holtWintersForecast(
  readings: GlucoseReading[],
  horizonHours = 2,
  intervalMinutes = 5
): ForecastResult {
  if (readings.length < 48) {
    // Not enough data — fall back to simple moving average
    return simpleMovingAverageForecast(readings, horizonHours, intervalMinutes);
  }

  const seasonLength = Math.round((24 * 60) / intervalMinutes); // 288 for 5-min
  const values = readings.map((r) => r.value);
  const n = values.length;

  // Need at least 2 full seasons for Holt-Winters
  if (n < seasonLength * 2) {
    return simpleMovingAverageForecast(readings, horizonHours, intervalMinutes);
  }

  // Smoothing parameters (empirically tuned for CGM data)
  const alpha = 0.3; // level
  const beta = 0.05; // trend
  const gamma = 0.15; // seasonality

  // Initialize level and trend from first season
  let level = values.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
  let trend = 0;
  for (let i = 0; i < seasonLength; i++) {
    trend += (values[seasonLength + i] - values[i]) / seasonLength;
  }
  trend /= seasonLength;

  // Initialize seasonal components
  const seasonal: number[] = new Array(n + seasonLength).fill(0);
  for (let i = 0; i < seasonLength; i++) {
    let sum = 0;
    let count = 0;
    for (let j = 0; j < Math.min(2, Math.floor(n / seasonLength)); j++) {
      const idx = j * seasonLength + i;
      if (idx < n) {
        const seasonAvg = values.slice(j * seasonLength, (j + 1) * seasonLength)
          .reduce((a, b) => a + b, 0) / seasonLength;
        sum += values[idx] - seasonAvg;
        count++;
      }
    }
    seasonal[i] = count > 0 ? sum / count : 0;
  }

  // Fitted values for error calculation
  const fitted: number[] = [];
  const errors: number[] = [];

  // Run Holt-Winters
  for (let t = 0; t < n; t++) {
    const y = values[t];
    const seasonIdx = t % seasonLength;
    const prevSeasonal = seasonal[seasonIdx];

    const newLevel = alpha * (y - prevSeasonal) + (1 - alpha) * (level + trend);
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
    seasonal[t + seasonLength] = gamma * (y - newLevel) + (1 - gamma) * prevSeasonal;

    level = newLevel;
    trend = newTrend;

    const fittedVal = level + trend + prevSeasonal;
    fitted.push(fittedVal);
    errors.push(Math.abs(y - fittedVal));
  }

  // Forecast
  const stepsAhead = Math.round((horizonHours * 60) / intervalMinutes);
  const predictions: ForecastPoint[] = [];
  const lastTimestamp = readings[readings.length - 1].timestamp;
  const intervalMs = intervalMinutes * 60 * 1000;

  // Error-based confidence interval
  const meanError = errors.length > 0
    ? errors.reduce((a, b) => a + b, 0) / errors.length
    : 20;
  const stdError = Math.sqrt(
    errors.reduce((sum, e) => sum + (e - meanError) ** 2, 0) / Math.max(errors.length - 1, 1)
  );

  for (let h = 1; h <= stepsAhead; h++) {
    const seasonIdx = (n + h) % seasonLength;
    const seasonVal = seasonal[seasonIdx] ?? 0;
    const predicted = level + h * trend + seasonVal;

    // Confidence widens with horizon
    const widening = 1.96 * stdError * Math.sqrt(h / 12);
    const clampedPrediction = Math.max(40, Math.min(400, predicted));

    predictions.push({
      timestamp: lastTimestamp + h * intervalMs,
      predicted: Math.round(clampedPrediction * 10) / 10,
      upperBound: Math.round(Math.min(400, clampedPrediction + widening) * 10) / 10,
      lowerBound: Math.round(Math.max(40, clampedPrediction - widening) * 10) / 10,
    });
  }

  // Model fit metrics
  const mape = values.length > 0
    ? (errors.reduce((a, b) => a + b, 0) / values.reduce((a, b) => a + b, 0)) * 100
    : 0;
  const rmse = Math.sqrt(
    fitted.reduce((sum, f, i) => sum + (f - values[i]) ** 2, 0) / Math.max(fitted.length, 1)
  );

  return {
    predictions,
    modelFit: {
      mape: Math.round(mape * 100) / 100,
      rmse: Math.round(rmse * 100) / 100,
    },
  };
}

/**
 * Fallback: Simple weighted moving average when insufficient data for Holt-Winters.
 */
function simpleMovingAverageForecast(
  readings: GlucoseReading[],
  horizonHours: number,
  intervalMinutes: number
): ForecastResult {
  const values = readings.map((r) => r.value);
  const n = values.length;
  if (n === 0) {
    return { predictions: [], modelFit: { mape: 0, rmse: 0 } };
  }

  // Weighted average of last 12 readings (1 hour at 5-min intervals)
  const windowSize = Math.min(12, n);
  let weightedSum = 0;
  let weightTotal = 0;
  for (let i = 0; i < windowSize; i++) {
    const weight = i + 1;
    weightedSum += values[n - windowSize + i] * weight;
    weightTotal += weight;
  }
  const avg = weightedSum / weightTotal;

  // Simple trend from last few readings
  const trendWindow = Math.min(6, n);
  const trendSlope = trendWindow > 1
    ? (values[n - 1] - values[n - trendWindow]) / trendWindow
    : 0;

  const stepsAhead = Math.round((horizonHours * 60) / intervalMinutes);
  const lastTimestamp = readings[n - 1].timestamp;
  const intervalMs = intervalMinutes * 60 * 1000;

  const predictions: ForecastPoint[] = [];
  for (let h = 1; h <= stepsAhead; h++) {
    const predicted = Math.max(40, Math.min(400, avg + trendSlope * h));
    const margin = 15 * Math.sqrt(h);
    predictions.push({
      timestamp: lastTimestamp + h * intervalMs,
      predicted: Math.round(predicted * 10) / 10,
      upperBound: Math.round(Math.min(400, predicted + margin) * 10) / 10,
      lowerBound: Math.round(Math.max(40, predicted - margin) * 10) / 10,
    });
  }

  return { predictions, modelFit: { mape: 0, rmse: 0 } };
}
