import type { PropsWithChildren } from "react";

type PageHeaderProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
}>;

export function PageHeader({ children, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}
