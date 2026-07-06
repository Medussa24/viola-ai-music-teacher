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

export type MusicSheetStatus = "draft" | "ready" | "needs_review" | "reviewed";
export type MusicClef = "alto" | "treble" | "bass" | "tenor";
export type MusicMaterialType =
  | "score_sheet"
  | "tuning_exercise"
  | "warmup"
  | "key_change_drill"
  | "rhythm_drill"
  | "bowing_exercise"
  | "original_composition";
export type NoteDuration = "whole" | "half" | "quarter" | "eighth" | "sixteenth";
export type Bowing = "up_bow" | "down_bow" | "none";
export type Articulation = "none" | "slur" | "staccato" | "accent" | "tenuto" | "pizzicato" | "arco" | "vibrato";

export type ScoreNote = {
  id: string;
  measure: number;
  beat: number;
  pitch?: string;
  octave?: number;
  duration: NoteDuration;
  isRest: boolean;
  articulation?: Articulation;
  bowing?: Bowing;
  fingering?: string;
  stringName?: "C" | "G" | "D" | "A";
};

export type MusicSheet = {
  id: string;
  title: string;
  composer?: string;
  materialType: MusicMaterialType;
  instrument: "viola" | "violin" | "cello" | "voice" | "piano";
  clef: MusicClef;
  keySignature: string;
  timeSignature: string;
  tempoBpm: number;
  source: MusicSheetSource;
  status: MusicSheetStatus;
  /**
   * Lightweight note metadata for future play-along, feedback, and analysis.
   * The rendered score should prefer musicXml when available.
   */
  notes: ScoreNote[];
  /**
   * MusicXML source used by OpenSheetMusicDisplay for real notation rendering.
   */
  musicXml?: string;
  createdAt: string;
  updatedAt: string;
  lastPracticedAt?: string;
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
