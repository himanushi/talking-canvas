// Web Speech APIの型定義
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  [index: number]: {
    transcript: string;
  };
}
