/**
 * Domain 1.2: WebLLM dynamic loader for client-side AI.
 * Feature-flagged via `local_ai`. Falls back to server AI if WebGPU unavailable.
 */

export interface LocalAIStatus {
  supported: boolean;
  reason?: string;
  gpuAdapter?: string;
}

/** Check if the browser supports WebGPU (required for WebLLM). */
export async function checkWebGPUSupport(): Promise<LocalAIStatus> {
  if (!('gpu' in navigator)) {
    return { supported: false, reason: 'WebGPU not available in this browser' };
  }

  try {
    const adapter = await (navigator as any).gpu.requestAdapter();
    if (!adapter) {
      return { supported: false, reason: 'No WebGPU adapter found' };
    }
    const info = await adapter.requestAdapterInfo?.();
    return {
      supported: true,
      gpuAdapter: info?.description || 'Unknown GPU',
    };
  } catch {
    return { supported: false, reason: 'WebGPU initialization failed' };
  }
}

/** Model configuration for T1D companion context */
export const LOCAL_MODEL_CONFIG = {
  modelId: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
  systemPrompt: `You are a helpful Type 1 Diabetes companion assistant. You provide general educational information about T1D management. You are NOT a doctor. Always recommend consulting healthcare providers for medical decisions. Never provide specific insulin dosing advice.`,
  maxTokens: 512,
  temperature: 0.7,
} as const;

/**
 * Dynamically load WebLLM engine from CDN.
 * Returns the engine instance or null if loading fails.
 */
export async function loadWebLLMEngine(
  onProgress?: (progress: { text: string; progress: number }) => void
): Promise<any | null> {
  try {
    // @ts-ignore - dynamically loaded from CDN at runtime
    const webllm = await import(/* @vite-ignore */ 'https://esm.run/@mlc-ai/web-llm');

    const engine = await webllm.CreateMLCEngine(LOCAL_MODEL_CONFIG.modelId, {
      initProgressCallback: (report: any) => {
        onProgress?.({
          text: report.text || 'Loading model...',
          progress: report.progress || 0,
        });
      },
    });

    return engine;
  } catch (error) {
    console.error('Failed to load WebLLM:', error);
    return null;
  }
}
