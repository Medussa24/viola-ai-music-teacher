import type {
  PracticePlan,
  ProgressSummary,
  SessionRecap,
  StudentProfile,
  TeacherMessage,
} from "../core/domain";

export type TeacherPrompt = {
  message: string;
  currentExerciseId?: string;
};

export type MusicTeacherService = {
  getProfile: () => Promise<StudentProfile>;
  getTodayPracticePlan: () => Promise<PracticePlan>;
  getProgressSummary: () => Promise<ProgressSummary>;
  getRecentRecaps: () => Promise<SessionRecap[]>;
  getTeacherThread: () => Promise<TeacherMessage[]>;
  sendTeacherMessage: (prompt: TeacherPrompt) => Promise<TeacherMessage>;
};

export type AudioAnalysisResult = {
  pitchAccuracy: number;
  rhythmAccuracy: number;
  notes: string[];
};

export type AudioAnalysisService = {
  analyzeRecording: (recording: Blob) => Promise<AudioAnalysisResult>;
};
