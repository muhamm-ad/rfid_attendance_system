import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
};

export function PageHeader({ icon: Icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="flex items-center gap-3 text-left">
        <Icon
          size={28}
          className="page-title-icon shrink-0"
          aria-hidden
        />
        <div className="page-title-group min-w-0">
          <h1 className="page-title gap-0">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
