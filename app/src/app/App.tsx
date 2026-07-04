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
import type { DemoRole } from "../core/domain";

export function App() {
  const [role, setRole] = useState<DemoRole>("student");
  const [route, setRoute] = useState<AppRoute>("dashboard");
  const musicTeacherService = useMemo(() => createMockMusicTeacherService(), []);

  const page = {
    dashboard: <DashboardPage musicTeacherService={musicTeacherService} onNavigate={setRoute} />,
    practice: <PracticePage musicTeacherService={musicTeacherService} />,
    music: <MusicLibraryPage musicTeacherService={musicTeacherService} />,
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
