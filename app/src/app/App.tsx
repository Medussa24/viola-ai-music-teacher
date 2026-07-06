import { useMemo, useState } from "react";
import { AppShell } from "./layout/AppShell";
import type { AppRoute } from "./navigation";
import { CoachPage } from "../features/coach/CoachPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { MusicLibraryPage } from "../features/music/MusicLibraryPage";
import { PracticePage } from "../features/practice/PracticePage";
import { ProgressPage } from "../features/progress/ProgressPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { TeacherDashboardPage } from "../features/teacher/TeacherDashboardPage";
import { createMockMusicTeacherService } from "../services/mockMusicTeacherService";
import type { DemoRole, MusicSheet } from "../core/domain";

export function App() {
  const [role, setRole] = useState<DemoRole>("student");
  const [route, setRoute] = useState<AppRoute>("dashboard");
  const [practiceQueueAdditions, setPracticeQueueAdditions] = useState<MusicSheet[]>([]);
  const musicTeacherService = useMemo(() => createMockMusicTeacherService(), []);

  function handleAddToPractice(sheet: MusicSheet) {
    setPracticeQueueAdditions((current) => {
      const alreadyAdded = current.some((item) => item.id === sheet.id);

      if (alreadyAdded) {
        return current;
      }

      return [...current, sheet];
    });
  }

  const page = {
    dashboard: <DashboardPage musicTeacherService={musicTeacherService} onNavigate={setRoute} />,
    practice: <PracticePage musicTeacherService={musicTeacherService} practiceQueueAdditions={practiceQueueAdditions} />,
    music: (
      <MusicLibraryPage
        musicTeacherService={musicTeacherService}
        onAddToPractice={handleAddToPractice}
        practiceQueueAdditions={practiceQueueAdditions}
      />
    ),
    coach: <CoachPage musicTeacherService={musicTeacherService} />,
    progress: <ProgressPage musicTeacherService={musicTeacherService} />,
    settings: <SettingsPage musicTeacherService={musicTeacherService} />,
    "teacher-dashboard": <TeacherDashboardPage musicTeacherService={musicTeacherService} />,
  }[route];

  function handleRoleChange(nextRole: DemoRole) {
    setRole(nextRole);
    setRoute(nextRole === "teacher" ? "teacher-dashboard" : "dashboard");
  }

  return (
    <AppShell activeRole={role} activeRoute={route} onNavigate={setRoute} onRoleChange={handleRoleChange}>
      {page}
    </AppShell>
  );
}
