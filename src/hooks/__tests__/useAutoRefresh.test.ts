import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoRefresh } from '../useAutoRefresh';

describe('useAutoRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls callback at interval', () => {
    const callback = vi.fn();
    renderHook(() => useAutoRefresh(callback, { intervalMs: 1000 }));

    expect(callback).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1000); });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('does not poll when enabled is false', () => {
    const callback = vi.fn();
    renderHook(() => useAutoRefresh(callback, { intervalMs: 1000, enabled: false }));

    act(() => { vi.advanceTimersByTime(5000); });
    expect(callback).not.toHaveBeenCalled();
  });

  it('manual refresh calls callback immediately', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAutoRefresh(callback, { intervalMs: 60000 }));

    act(() => { result.current.refresh(); });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('togglePolling stops and starts', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useAutoRefresh(callback, { intervalMs: 1000 }));

    expect(result.current.isPolling).toBe(true);

    act(() => { result.current.togglePolling(); });
    expect(result.current.isPolling).toBe(false);

    act(() => { vi.advanceTimersByTime(3000); });
    expect(callback).not.toHaveBeenCalled();

    act(() => { result.current.togglePolling(); });
    expect(result.current.isPolling).toBe(true);
  });
});
