export type SkillLevel = "beginner" | "early-intermediate" | "intermediate";

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
