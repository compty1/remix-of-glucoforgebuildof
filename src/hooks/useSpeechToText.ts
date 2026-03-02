/**
 * Phase 18.1: Voice-to-Text Logging
 * Web Speech API hook for voice input with transcript output.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechToTextState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

interface SpeechToTextReturn extends SpeechToTextState {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechToText(lang = 'en-US'): SpeechToTextReturn {
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const [state, setState] = useState<SpeechToTextState>({
    isListening: false,
    transcript: '',
    error: null,
    isSupported,
  });

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setState((s) => ({ ...s, error: 'Speech recognition not supported in this browser.' }));
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setState((s) => ({ ...s, transcript: finalTranscript }));
    };

    recognition.onerror = (event: any) => {
      setState((s) => ({ ...s, error: event.error, isListening: false }));
    };

    recognition.onend = () => {
      setState((s) => ({ ...s, isListening: false }));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState((s) => ({ ...s, isListening: true, error: null }));
  }, [isSupported, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((s) => ({ ...s, transcript: '', error: null }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
