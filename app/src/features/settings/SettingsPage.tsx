import { useEffect, useState } from "react";
import type { StudentProfile } from "../../core/domain";
import type { MusicTeacherService } from "../../services/contracts";
import { PageHeader } from "../../shared/ui/PageHeader";

type SettingsPageProps = {
  musicTeacherService: MusicTeacherService;
};

export function SettingsPage({ musicTeacherService }: SettingsPageProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    void musicTeacherService.getProfile().then(setProfile);
  }, [musicTeacherService]);

  if (!profile) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <section className="page-stack">
      <PageHeader eyebrow="Settings" title="Learning profile" />

      <section className="settings-grid">
        <label>
          Display name
          <input defaultValue={profile.displayName} />
        </label>
        <label>
          Instrument
          <input defaultValue="Viola" readOnly />
        </label>
        <label>
          Skill level
          <select defaultValue={profile.level}>
            <option value="beginner">Beginner</option>
            <option value="early-intermediate">Early intermediate</option>
            <option value="intermediate">Intermediate</option>
          </select>
        </label>
        <label>
          Weekly goal
          <input defaultValue={profile.weeklyPracticeGoalMinutes} type="number" />
        </label>
      </section>

      <section className="panel">
        <h2>Service Readiness</h2>
        <div className="readiness-list">
          <p><strong>AI teacher:</strong> mock service active</p>
          <p><strong>Audio analysis:</strong> interface ready</p>
          <p><strong>Progress storage:</strong> mock service active</p>
          <p><strong>Authentication:</strong> provider slot reserved</p>
        </div>
      </section>
    </section>
  );
}
