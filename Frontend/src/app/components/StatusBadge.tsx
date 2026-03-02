import { Badge } from "./ui/badge";

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  clickable?: boolean;
  onClick?: () => void;
}

export function StatusBadge({ status, variant = 'default', clickable = false, onClick }: StatusBadgeProps) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    success: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    warning: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
    error: 'bg-rose-100 text-rose-700 hover:bg-rose-200',
  };

  return (
    <Badge
      className={`${variantClasses[variant]} ${clickable ? 'cursor-pointer transition-colors' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      {status}
    </Badge>
  );
}
