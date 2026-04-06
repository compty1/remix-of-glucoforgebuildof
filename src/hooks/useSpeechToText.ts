/**
 * Phase 18.1: Voice-to-Text Logging
 * Bug 269: Stops existing recognition before starting new.
 * Bug 270: Only concatenates final results.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechToTextState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

interface SpeechToTextReturn extends Omit<SpeechToTextState, 'interimTranscript'> {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  interimTranscript: string;
}

export function useSpeechToText(lang = 'en-US'): SpeechToTextReturn {
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const [state, setState] = useState<SpeechToTextState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
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

    // Bug 269: Stop existing before starting new
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      setState((s) => ({
        ...s,
        transcript: s.transcript + finalTranscript,
        interimTranscript,
      }));
    };

    recognition.onerror = (event: any) => {
      setState((s) => ({ ...s, error: event.error, isListening: false }));
    };

    recognition.onend = () => {
      setState((s) => ({ ...s, isListening: false, interimTranscript: '' }));
    };

    recognitionRef.current = recognition;
    recognition.start();
    setState((s) => ({ ...s, isListening: true, error: null, interimTranscript: '' }));
  }, [isSupported, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState((s) => ({ ...s, isListening: false, interimTranscript: '' }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState((s) => ({ ...s, transcript: '', interimTranscript: '', error: null }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
