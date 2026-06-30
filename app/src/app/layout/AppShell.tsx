import { Music2 } from "lucide-react";
import type { PropsWithChildren } from "react";
import type { AppRoute } from "../navigation";
import { navigationItems } from "../navigation";

type AppShellProps = PropsWithChildren<{
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}>;

export function AppShell({ activeRoute, children, onNavigate }: AppShellProps) {
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
