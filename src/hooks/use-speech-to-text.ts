import { useState, useCallback, useEffect, useRef } from 'react';

type SpeechState = 'unavailable' | 'idle' | 'listening' | 'error';

interface UseSpeechToTextReturn {
  state: SpeechState;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  errorMessage: string | null;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [state, setState] = useState<SpeechState>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) {
      setState('unavailable');
      return;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setState('error');
      setErrorMessage(event.error === 'not-allowed' 
        ? 'Microphone permission denied' 
        : 'Speech recognition error');
    };

    recognition.onend = () => {
      setState('idle');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || state === 'unavailable') return;
    
    setTranscript('');
    setErrorMessage(null);
    
    try {
      recognitionRef.current.start();
      setState('listening');
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setState('error');
    }
  }, [state]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
    setState('idle');
  }, []);

  return {
    state,
    transcript,
    startListening,
    stopListening,
    isSupported,
    errorMessage,
  };
}
