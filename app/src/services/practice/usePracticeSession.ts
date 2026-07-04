import { useCallback, useEffect, useMemo, useState } from "react";
import type { PracticeExercise } from "../../core/domain";

type StoredPracticeSession = {
  completedExerciseIds: string[];
  updatedAt: string;
};

const storageKeyForPlan = (planId: string) => `viola.practice-session.${planId}`;

function readStoredSession(planId: string): StoredPracticeSession | null {
  try {
    const stored = window.localStorage.getItem(storageKeyForPlan(planId));
    return stored ? (JSON.parse(stored) as StoredPracticeSession) : null;
  } catch {
    return null;
  }
}

export function usePracticeSession(planId: string, exercises: PracticeExercise[]) {
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>(() => {
    return readStoredSession(planId)?.completedExerciseIds ?? [];
  });

  useEffect(() => {
    const stored = readStoredSession(planId);
    setCompletedExerciseIds(stored?.completedExerciseIds ?? []);
  }, [planId]);

  useEffect(() => {
    const session: StoredPracticeSession = {
      completedExerciseIds,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(storageKeyForPlan(planId), JSON.stringify(session));
  }, [completedExerciseIds, planId]);

  const completedSet = useMemo(() => new Set(completedExerciseIds), [completedExerciseIds]);

  const completedMinutes = useMemo(() => {
    return exercises
      .filter((exercise) => completedSet.has(exercise.id))
      .reduce((total, exercise) => total + exercise.minutes, 0);
  }, [completedSet, exercises]);

  const totalMinutes = useMemo(() => {
    return exercises.reduce((total, exercise) => total + exercise.minutes, 0);
  }, [exercises]);

  const completionPercent = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

  const toggleExercise = useCallback((exerciseId: string) => {
    setCompletedExerciseIds((current) => {
      if (current.includes(exerciseId)) {
        return current.filter((id) => id !== exerciseId);
      }

      return [...current, exerciseId];
    });
  }, []);

  const completeExercise = useCallback((exerciseId: string) => {
    setCompletedExerciseIds((current) => {
      if (current.includes(exerciseId)) {
        return current;
      }

      return [...current, exerciseId];
    });
  }, []);

  const resetSession = useCallback(() => {
    setCompletedExerciseIds([]);
    window.localStorage.removeItem(storageKeyForPlan(planId));
  }, [planId]);

  return {
    completedExerciseIds,
    completedMinutes,
    completedSet,
    completeExercise,
    completionPercent,
    isComplete: completedExerciseIds.length === exercises.length,
    resetSession,
    toggleExercise,
    totalMinutes,
  };
}
