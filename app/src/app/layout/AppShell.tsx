import { Music2 } from "lucide-react";
import type { PropsWithChildren } from "react";
import type { DemoRole } from "../../core/domain";
import type { AppRoute } from "../navigation";
import { navigationItemsByRole } from "../navigation";

type AppShellProps = PropsWithChildren<{
  activeRoute: AppRoute;
  activeRole: DemoRole;
  onNavigate: (route: AppRoute) => void;
  onRoleChange: (role: DemoRole) => void;
}>;

export function AppShell({ activeRole, activeRoute, children, onNavigate, onRoleChange }: AppShellProps) {
  const navigationItems = navigationItemsByRole[activeRole];

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Music2 size={22} />
          </div>
          <div>
            <p className="brand-name">Viola</p>
            <p className="brand-subtitle">AI Music Teacher</p>
          </div>
        </div>

        <div className="role-switcher" aria-label="Demo mode selector">
          <button
            className={activeRole === "student" ? "role-option active" : "role-option"}
            type="button"
            onClick={() => onRoleChange("student")}
          >
            Student
          </button>
          <button
            className={activeRole === "teacher" ? "role-option active" : "role-option"}
            type="button"
            onClick={() => onRoleChange("teacher")}
          >
            Teacher
          </button>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;

            return (
              <button
                key={item.route}
                className={isActive ? "nav-item active" : "nav-item"}
                type="button"
                onClick={() => onNavigate(item.route)}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
