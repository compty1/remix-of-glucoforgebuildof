/**
 * Domain 1.2: Hook for client-side local AI via WebLLM.
 * Same ChatMessage interface as useT1DChat for drop-in replacement.
 */
import { useState, useRef, useCallback } from 'react';
import {
  checkWebGPUSupport,
  loadWebLLMEngine,
  LOCAL_MODEL_CONFIG,
  type LocalAIStatus,
} from '@/utils/webllmLoader';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface UseLocalAIReturn {
  isSupported: boolean | null;
  isLoading: boolean;
  isModelLoaded: boolean;
  loadProgress: { text: string; progress: number } | null;
  sendMessage: (messages: ChatMessage[]) => Promise<string>;
  loadModel: () => Promise<boolean>;
  status: LocalAIStatus | null;
}

export function useLocalAI(): UseLocalAIReturn {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState<{ text: string; progress: number } | null>(null);
  const [status, setStatus] = useState<LocalAIStatus | null>(null);
  const engineRef = useRef<any>(null);

  const loadModel = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    const gpuStatus = await checkWebGPUSupport();
    setStatus(gpuStatus);
    setIsSupported(gpuStatus.supported);

    if (!gpuStatus.supported) {
      setIsLoading(false);
      return false;
    }

    const engine = await loadWebLLMEngine((progress) => {
      setLoadProgress(progress);
    });

    if (engine) {
      engineRef.current = engine;
      setIsModelLoaded(true);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  }, []);

  const sendMessage = useCallback(async (messages: ChatMessage[]): Promise<string> => {
    if (!engineRef.current) {
      throw new Error('Model not loaded');
    }

    const formattedMessages = [
      { role: 'system', content: LOCAL_MODEL_CONFIG.systemPrompt },
      ...messages,
    ];

    const reply = await engineRef.current.chat.completions.create({
      messages: formattedMessages,
      max_tokens: LOCAL_MODEL_CONFIG.maxTokens,
      temperature: LOCAL_MODEL_CONFIG.temperature,
    });

    return reply.choices[0]?.message?.content || 'I could not generate a response.';
  }, []);

  return {
    isSupported,
    isLoading,
    isModelLoaded,
    loadProgress,
    sendMessage,
    loadModel,
    status,
  };
}
