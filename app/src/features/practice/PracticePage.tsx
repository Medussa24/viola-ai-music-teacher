import { AudioLines, CheckCircle2, Circle, Mic, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useState } from "react";
import type { MusicMaterialType, MusicSheet, PracticePlan } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { useAudioRecorder } from "../../services/audio/useAudioRecorder";
import { usePracticeSession } from "../../services/practice/usePracticeSession";
import { Button } from "../../shared/ui/Button";
import { PageHeader } from "../../shared/ui/PageHeader";

type PracticePageProps = {
  musicTeacherService: MusicTeacherService;
  practiceQueueAdditions: MusicSheet[];
};

const materialTypeLabels: Record<MusicMaterialType, string> = {
  score_sheet: "Score sheet",
  tuning_exercise: "Tuning exercise",
  warmup: "Warmup",
  key_change_drill: "Key-change drill",
  rhythm_drill: "Rhythm drill",
  bowing_exercise: "Bowing exercise",
  original_composition: "Original composition",
};

export function PracticePage({ musicTeacherService, practiceQueueAdditions }: PracticePageProps) {
  const [plan, setPlan] = useState<PracticePlan | null>(null);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const recorder = useAudioRecorder();
  const exercises = plan?.exercises ?? [];
  const session = usePracticeSession(plan?.id ?? "loading", exercises);

  useEffect(() => {
    void musicTeacherService.getTodayPracticePlan().then((nextPlan) => {
      setPlan(nextPlan);
      setActiveExerciseId((currentExerciseId) => currentExerciseId ?? nextPlan.exercises[0]?.id ?? null);
    });
  }, [musicTeacherService]);

  if (!plan || exercises.length === 0) {
    return <div className="loading">Loading practice plan...</div>;
  }

  const activeExercise = exercises.find((exercise) => exercise.id === activeExerciseId) ?? exercises[0];
  const lessonBlocks = [
    {
      label: "Tuning",
      title: "Open String Tuning Check",
      detail: "Listen for centered C, G, D, and A strings before the lesson starts.",
    },
    {
      label: "Warmup",
      title: exercises.find((exercise) => exercise.category === "warmup")?.title ?? "Tone Warmup",
      detail: "Prepare bow speed, posture, and steady sound.",
    },
    {
      label: "Key Change",
      title: "D Major Setup",
      detail: "Find the key center, finger pattern, and first scale shape.",
    },
    {
      label: "Score / Exercise",
      title: activeExercise.title,
      detail: activeExercise.description,
    },
    {
      label: "Added from My Music",
      title:
        practiceQueueAdditions.length > 0
          ? `${practiceQueueAdditions.length} library item${practiceQueueAdditions.length === 1 ? "" : "s"}`
          : "No added items yet",
      detail: practiceQueueAdditions[0]?.title ?? "Add a score, warmup, tuning drill, or exercise from My Music.",
    },
    {
      label: "Record Take",
      title: "Capture the selected exercise",
      detail: "Record Take will capture your performance for this selected score or exercise.",
    },
    {
      label: "Feedback",
      title: "Review and try again",
      detail: "AI feedback will later summarize pitch, rhythm, tone, and next steps.",
    },
  ];

  return (
    <section className="page-stack">
      <PageHeader eyebrow={plan.dateLabel} title="Today's Guided Lesson" />

      <section className="session-progress">
        <div>
          <span>Session progress</span>
          <strong>
            {session.completedMinutes}/{session.totalMinutes} minutes
          </strong>
        </div>
        <div className="progress-track" aria-label={`${session.completionPercent}% complete`}>
          <span style={{ width: `${session.completionPercent}%` }} />
        </div>
        <button className="icon-text-button" type="button" onClick={session.resetSession}>
          <RotateCcw size={16} />
          Reset
        </button>
      </section>

      <section className="lesson-flow-grid" aria-label="Today's lesson flow">
        {lessonBlocks.map((block) => (
          <article className="lesson-flow-card" key={block.label}>
            <span>{block.label}</span>
            <strong>{block.title}</strong>
            <p>{block.detail}</p>
          </article>
        ))}
      </section>

      {practiceQueueAdditions.length > 0 ? (
        <section className="practice-additions-panel">
          <div className="section-heading">
            <div>
              <h2>Added from My Music</h2>
              <p>Local score book items selected for today's guided lesson.</p>
            </div>
          </div>
          <div className="practice-addition-list">
            {practiceQueueAdditions.map((item) => (
              <article className="practice-addition-item" key={item.id}>
                <span>{materialTypeLabels[item.materialType]}</span>
                <strong>{item.title}</strong>
                <small>
                  {item.clef} clef - {item.keySignature} - {item.tempoBpm} BPM
                </small>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="practice-layout">
        <div className="practice-focus">
          <p className="eyebrow">Active lesson item</p>
          <h2>{activeExercise.title}</h2>
          <p>{activeExercise.description}</p>
          <div className={recorder.status === "recording" ? "recording-strip active" : "recording-strip"}>
            <AudioLines size={20} />
            <div>
              <strong>{recorder.status === "recording" ? "Recording your take" : "Record Take"}</strong>
              <span>
                {recorder.status === "requesting"
                  ? "Waiting for microphone permission"
                  : "Record Take will capture your performance for this selected score or exercise."}
              </span>
            </div>
          </div>
          {recorder.error ? <p className="inline-error">{recorder.error}</p> : null}
          <div className="meter-shell" aria-label="Mock live analysis">
            <div>
              <span>Pitch</span>
              <strong>Ready</strong>
            </div>
            <div>
              <span>Rhythm</span>
              <strong>Ready</strong>
            </div>
            <div>
              <span>Tone</span>
              <strong>Ready</strong>
            </div>
          </div>
          <div className="transport">
            <Button
              disabled={recorder.status === "requesting"}
              onClick={recorder.status === "recording" ? recorder.stop : recorder.start}
              variant={recorder.status === "recording" ? "secondary" : "primary"}
            >
              {recorder.status === "recording" ? <Square size={18} /> : <Mic size={18} />}
              {recorder.status === "recording"
                ? "Stop Take"
                : recorder.status === "requesting"
                  ? "Allow Mic"
                  : "Record Take"}
            </Button>
            <Button variant="secondary">
              <Play size={18} />
              Reference
            </Button>
            <Button variant="ghost" onClick={() => session.completeExercise(activeExercise.id)}>
              <CheckCircle2 size={18} />
              Mark Complete
            </Button>
          </div>
          {session.isComplete ? (
            <div className="session-complete">
              <strong>Session complete</strong>
              <span>Nice work. Next we can turn your recordings into coach feedback.</span>
            </div>
          ) : null}
        </div>

        <div className="panel">
          <h2>Session Queue</h2>
          <div className="exercise-list compact">
            {exercises.map((exercise) => {
              const isActive = exercise.id === activeExercise.id;
              const isCompleted = session.completedSet.has(exercise.id);

              return (
                <div
                  className={`${isActive ? "queue-item active" : "queue-item"} ${isCompleted ? "completed" : ""}`}
                  key={exercise.id}
                >
                  <button className="queue-select" type="button" onClick={() => setActiveExerciseId(exercise.id)}>
                    {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    <span>{exercise.title}</span>
                  </button>
                  <button
                    aria-label={isCompleted ? `Mark ${exercise.title} incomplete` : `Mark ${exercise.title} complete`}
                    className="mini-check"
                    type="button"
                    onClick={() => session.toggleExercise(exercise.id)}
                  >
                    {exercise.minutes}m
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Recorded Takes</h2>
          <span className="soft-count">{recorder.recordings.length} saved locally</span>
        </div>
        {recorder.recordings.length > 0 ? (
          <div className="recording-list">
            {recorder.recordings.map((recording, index) => (
              <article className="recording-item" key={recording.id}>
                <div>
                  <span>Take {recorder.recordings.length - index}</span>
                  <strong>{activeExercise.title}</strong>
                  <small>
                    {recording.createdAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} -{" "}
                    {recording.durationSeconds}s
                  </small>
                </div>
                <audio controls src={recording.url}>
                  <track kind="captions" />
                </audio>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <AudioLines size={22} />
            <p>Record a short take, listen back, then decide what the coach should analyze later.</p>
          </div>
        )}
      </section>
    </section>
  );
}
