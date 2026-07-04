import { AudioLines, CheckCircle2, Circle, Mic, Play, RotateCcw, Square } from "lucide-react";
import { useEffect, useState } from "react";
import type { PracticePlan } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { useAudioRecorder } from "../../services/audio/useAudioRecorder";
import { usePracticeSession } from "../../services/practice/usePracticeSession";
import { Button } from "../../shared/ui/Button";
import { PageHeader } from "../../shared/ui/PageHeader";

type PracticePageProps = {
  musicTeacherService: MusicTeacherService;
};

export function PracticePage({ musicTeacherService }: PracticePageProps) {
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

  return (
    <section className="page-stack">
      <PageHeader eyebrow={plan.dateLabel} title="Practice Room">
        <Button
          onClick={recorder.status === "recording" ? recorder.stop : recorder.start}
          variant={recorder.status === "recording" ? "secondary" : "primary"}
        >
          {recorder.status === "recording" ? <Square size={18} /> : <Mic size={18} />}
          {recorder.status === "recording" ? "Stop" : "Record"}
        </Button>
      </PageHeader>

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

      <section className="practice-layout">
        <div className="practice-focus">
          <p className="eyebrow">Now playing</p>
          <h2>{activeExercise.title}</h2>
          <p>{activeExercise.description}</p>
          <div className={recorder.status === "recording" ? "recording-strip active" : "recording-strip"}>
            <AudioLines size={20} />
            <div>
              <strong>{recorder.status === "recording" ? "Recording your take" : "Recorder ready"}</strong>
              <span>
                {recorder.status === "requesting"
                  ? "Waiting for microphone permission"
                  : "Takes stay local until backend storage is connected."}
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
