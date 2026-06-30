import type { PracticePlan, ProgressSummary, SessionRecap, StudentProfile, TeacherMessage } from "./domain";

export const mockStudentProfile: StudentProfile = {
  id: "student-demo",
  displayName: "Jeremy",
  instrument: "viola",
  level: "beginner",
  weeklyPracticeGoalMinutes: 120,
  currentFocus: ["Alto clef reading", "Open string tone", "Steady counting"],
};

export const mockPracticePlan: PracticePlan = {
  id: "plan-today",
  dateLabel: "Today",
  headline: "Build a steadier tone and cleaner note reading",
  targetMinutes: 25,
  exercises: [
    {
      id: "open-string-tone",
      title: "Open String Tone Ladder",
      category: "warmup",
      minutes: 5,
      description: "Play C, G, D, and A strings with long bows and consistent volume.",
      focusMetric: "tone",
    },
    {
      id: "alto-clef-notes",
      title: "Alto Clef Quick Read",
      category: "theory",
      minutes: 5,
      description: "Name and play notes around middle C without looking at finger labels.",
      focusMetric: "reading",
    },
    {
      id: "quarter-note-pulse",
      title: "Quarter Note Pulse",
      category: "rhythm",
      minutes: 6,
      description: "Tap and play quarter notes at 72 BPM with a metronome.",
      focusMetric: "rhythm",
    },
    {
      id: "first-scale",
      title: "D Major Starter Scale",
      category: "technique",
      minutes: 9,
      description: "Practice D major in one octave, pausing on any note that sounds sharp or flat.",
      focusMetric: "pitch",
    },
  ],
};

export const mockProgressSummary: ProgressSummary = {
  streakDays: 5,
  weeklyMinutes: 86,
  pitchAccuracy: 78,
  rhythmAccuracy: 84,
  completedSessions: 12,
  strongestSkill: "Rhythm consistency",
  nextFocus: "D string intonation",
};

export const mockTeacherMessages: TeacherMessage[] = [
  {
    id: "teacher-1",
    role: "teacher",
    content: "Today we are keeping the session focused: steady bow, clear alto clef notes, and one scale played slowly enough to hear every pitch.",
  },
  {
    id: "student-1",
    role: "student",
    content: "I keep mixing up C and E in alto clef.",
  },
  {
    id: "teacher-2",
    role: "teacher",
    content: "Good catch. Anchor middle C on the center line first, then count by steps. Do five slow reads before you touch the instrument.",
  },
];

export const mockSessionRecaps: SessionRecap[] = [
  {
    id: "recap-1",
    title: "Tone and pulse",
    dateLabel: "Yesterday",
    summary: "Your pulse stayed consistent through the open string exercise, and the D string notes were more centered by the final take.",
    wins: ["Held tempo at 72 BPM", "Cleaner long bows", "Fewer note-name hesitations"],
    nextSteps: ["Repeat D major slowly", "Spend two minutes on C/E recognition"],
  },
  {
    id: "recap-2",
    title: "Reading check",
    dateLabel: "Saturday",
    summary: "Alto clef reading is getting faster, especially around middle C. Lower notes still need slower counting.",
    wins: ["Improved note naming", "Good posture reminders"],
    nextSteps: ["Review notes below middle C", "Keep bow speed even"],
  },
];
