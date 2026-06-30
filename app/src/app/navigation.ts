import {
  BarChart3,
  Bot,
  CalendarCheck,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AppRoute = "dashboard" | "practice" | "coach" | "progress" | "settings";

export type NavigationItem = {
  route: AppRoute;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { route: "dashboard", label: "Home", icon: Home },
  { route: "practice", label: "Practice", icon: CalendarCheck },
  { route: "coach", label: "Coach", icon: Bot },
  { route: "progress", label: "Progress", icon: BarChart3 },
  { route: "settings", label: "Settings", icon: Settings },
];
