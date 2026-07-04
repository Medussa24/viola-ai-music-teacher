export type SkillLevel = "beginner" | "early-intermediate" | "intermediate";

export type DemoRole = "student" | "teacher";

export type StudentProfile = {
  id: string;
  displayName: string;
  instrument: "viola";
  level: SkillLevel;
  weeklyPracticeGoalMinutes: number;
  currentFocus: string[];
};

export type PracticeExercise = {
  id: string;
  title: string;
  category: "warmup" | "technique" | "rhythm" | "repertoire" | "theory";
  minutes: number;
  description: string;
  focusMetric: "pitch" | "rhythm" | "tone" | "reading" | "consistency";
};

export type PracticePlan = {
  id: string;
  dateLabel: string;
  headline: string;
  targetMinutes: number;
  exercises: PracticeExercise[];
};

export type MusicSheetSource = "teacher_assigned" | "manual" | "recorded_draft" | "imported";

export type ScoreSheetStatus = "new" | "learning" | "polishing" | "performance-ready" | "draft" | "needs_review";

export type ScoreNote = {
  id: string;
  measure: number;
  pitch: string;
  duration: "eighth" | "quarter" | "half" | "dotted-half" | "whole";
  octave?: number;
  articulation?: string;
  bowing?: "down-bow" | "up-bow" | "slur" | "pizzicato";
  stringName?: "C" | "G" | "D" | "A";
};

export type ScoreSheet = {
  id: string;
  title: string;
  composer: string;
  level: SkillLevel;
  keySignature: string;
  timeSignature: string;
  tempoMarking: string;
  tempoBpm: number;
  source: MusicSheetSource;
  status: ScoreSheetStatus;
  assignedFocus: string[];
  lastPracticedLabel: string;
  practiceMinutes: number;
  measuresToReview: string;
  teacherNote: string;
  notes: ScoreNote[];
};

export type ProgressSummary = {
  streakDays: number;
  weeklyMinutes: number;
  pitchAccuracy: number;
  rhythmAccuracy: number;
  completedSessions: number;
  strongestSkill: string;
  nextFocus: string;
};

export type TeacherMessage = {
  id: string;
  role: "teacher" | "student";
  content: string;
};

export type SessionRecap = {
  id: string;
  title: string;
  dateLabel: string;
  summary: string;
  wins: string[];
  nextSteps: string[];
};

export type TeacherDashboardStudent = {
  id: string;
  studentName: string;
  assignedPracticePlan: string;
  weeklyPracticeMinutes: number;
  completedExercises: string[];
  recentSessionSummary: string;
  teacherNotes: string[];
  nextFocusArea: string;
  reviewStatus: "ready" | "needs-review" | "reviewed";
};
