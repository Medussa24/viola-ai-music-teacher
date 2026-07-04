import {
  BarChart3,
  Bot,
  CalendarCheck,
  Home,
  Library,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DemoRole } from "../core/domain";

export type AppRoute = "dashboard" | "practice" | "coach" | "progress" | "music" | "settings" | "teacher-dashboard";

export type NavigationItem = {
  route: AppRoute;
  label: string;
  icon: LucideIcon;
};

export const studentNavigationItems: NavigationItem[] = [
  { route: "dashboard", label: "Home", icon: Home },
  { route: "practice", label: "Practice", icon: CalendarCheck },
  { route: "coach", label: "Coach", icon: Bot },
  { route: "progress", label: "Progress", icon: BarChart3 },
  { route: "music", label: "My Music", icon: Library },
  { route: "settings", label: "Settings", icon: Settings },
];

export const teacherNavigationItems: NavigationItem[] = [
  { route: "teacher-dashboard", label: "Teacher", icon: Users },
];

export const navigationItemsByRole: Record<DemoRole, NavigationItem[]> = {
  student: studentNavigationItems,
  teacher: teacherNavigationItems,
};
