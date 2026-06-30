import { useMemo, useState } from "react";
import { AppShell } from "./layout/AppShell";
import type { AppRoute } from "./navigation";
import { CoachPage } from "../features/coach/CoachPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { PracticePage } from "../features/practice/PracticePage";
import { ProgressPage } from "../features/progress/ProgressPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { createMockMusicTeacherService } from "../services/mockMusicTeacherService";

export function App() {
  const [route, setRoute] = useState<AppRoute>("dashboard");
  const musicTeacherService = useMemo(() => createMockMusicTeacherService(), []);

  const page = {
    dashboard: <DashboardPage musicTeacherService={musicTeacherService} onNavigate={setRoute} />,
    practice: <PracticePage musicTeacherService={musicTeacherService} />,
    coach: <CoachPage musicTeacherService={musicTeacherService} />,
    progress: <ProgressPage musicTeacherService={musicTeacherService} />,
    settings: <SettingsPage musicTeacherService={musicTeacherService} />,
  }[route];

  return (
    <AppShell activeRoute={route} onNavigate={setRoute}>
      {page}
    </AppShell>
  );
}
