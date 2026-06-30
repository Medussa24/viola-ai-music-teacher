import { ArrowRight, Headphones, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppRoute } from "../../app/navigation";
import type { PracticePlan, ProgressSummary, StudentProfile } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { Button } from "../../shared/ui/Button";
import { Metric } from "../../shared/ui/Metric";
import { PageHeader } from "../../shared/ui/PageHeader";
import heroImage from "../../assets/practice-room-hero.png";

type DashboardPageProps = {
  musicTeacherService: MusicTeacherService;
  onNavigate: (route: AppRoute) => void;
};

export function DashboardPage({ musicTeacherService, onNavigate }: DashboardPageProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [plan, setPlan] = useState<PracticePlan | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    void Promise.all([
      musicTeacherService.getProfile(),
      musicTeacherService.getTodayPracticePlan(),
      musicTeacherService.getProgressSummary(),
    ]).then(([nextProfile, nextPlan, nextProgress]) => {
      setProfile(nextProfile);
      setPlan(nextPlan);
      setProgress(nextProgress);
    });
  }, [musicTeacherService]);

  if (!profile || !plan || !progress) {
    return <div className="loading">Preparing your practice room...</div>;
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Today" title={`Good practice starts small, ${profile.displayName}.`}>
        <Button onClick={() => onNavigate("practice")}>
          <Play size={18} />
          Start
        </Button>
      </PageHeader>

      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">Practice plan</p>
          <h2>{plan.headline}</h2>
          <p>{plan.targetMinutes} focused minutes across tone, reading, rhythm, and intonation.</p>
          <div className="hero-actions">
            <Button onClick={() => onNavigate("practice")}>
              <Play size={18} />
              Begin Session
            </Button>
            <Button variant="secondary" onClick={() => onNavigate("coach")}>
              <Sparkles size={18} />
              Ask Coach
            </Button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <img alt="" src={heroImage} />
          <div className="listening-card">
            <Headphones size={18} />
            <span>Coach ready</span>
          </div>
        </div>
      </section>

      <section className="metric-grid" aria-label="Progress summary">
        <Metric label="Streak" value={`${progress.streakDays} days`} detail="Current rhythm" />
        <Metric label="This week" value={`${progress.weeklyMinutes} min`} detail="Practice logged" />
        <Metric label="Pitch" value={`${progress.pitchAccuracy}%`} detail="Recent accuracy" />
        <Metric label="Rhythm" value={`${progress.rhythmAccuracy}%`} detail="Recent accuracy" />
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="section-heading">
            <h2>Today's Exercises</h2>
            <button className="text-action" type="button" onClick={() => onNavigate("practice")}>
              Open <ArrowRight size={16} />
            </button>
          </div>
          <div className="exercise-list">
            {plan.exercises.map((exercise) => (
              <article className="exercise-item" key={exercise.id}>
                <div>
                  <span className="pill">{exercise.category}</span>
                  <h3>{exercise.title}</h3>
                  <p>{exercise.description}</p>
                </div>
                <strong>{exercise.minutes}m</strong>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Teacher Notes</h2>
          <div className="note-list">
            {profile.currentFocus.map((focus) => (
              <p key={focus}>{focus}</p>
            ))}
          </div>
          <div className="coach-callout">
            <span>Next focus</span>
            <strong>{progress.nextFocus}</strong>
          </div>
        </div>
      </section>
    </section>
  );
}
