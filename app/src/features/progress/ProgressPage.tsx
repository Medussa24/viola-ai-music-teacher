import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProgressSummary, SessionRecap } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { Metric } from "../../shared/ui/Metric";
import { PageHeader } from "../../shared/ui/PageHeader";

type ProgressPageProps = {
  musicTeacherService: MusicTeacherService;
};

export function ProgressPage({ musicTeacherService }: ProgressPageProps) {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [recaps, setRecaps] = useState<SessionRecap[]>([]);

  useEffect(() => {
    void Promise.all([
      musicTeacherService.getProgressSummary(),
      musicTeacherService.getRecentRecaps(),
    ]).then(([nextProgress, nextRecaps]) => {
      setProgress(nextProgress);
      setRecaps(nextRecaps);
    });
  }, [musicTeacherService]);

  if (!progress) {
    return <div className="loading">Loading progress...</div>;
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Progress" title="Your practice is taking shape.">
        <div className="header-badge">
          <TrendingUp size={18} />
          {progress.strongestSkill}
        </div>
      </PageHeader>

      <section className="metric-grid">
        <Metric label="Sessions" value={`${progress.completedSessions}`} detail="Completed" />
        <Metric label="Streak" value={`${progress.streakDays} days`} detail="Keep it warm" />
        <Metric label="Pitch" value={`${progress.pitchAccuracy}%`} detail="Recent takes" />
        <Metric label="Rhythm" value={`${progress.rhythmAccuracy}%`} detail="Recent takes" />
      </section>

      <section className="panel">
        <h2>Recent Recaps</h2>
        <div className="recap-list">
          {recaps.map((recap) => (
            <article className="recap-item" key={recap.id}>
              <div>
                <span>{recap.dateLabel}</span>
                <h3>{recap.title}</h3>
                <p>{recap.summary}</p>
              </div>
              <div className="recap-columns">
                <div>
                  <strong>Wins</strong>
                  {recap.wins.map((win) => (
                    <small key={win}>{win}</small>
                  ))}
                </div>
                <div>
                  <strong>Next</strong>
                  {recap.nextSteps.map((step) => (
                    <small key={step}>{step}</small>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
