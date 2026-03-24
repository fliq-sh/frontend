import { Info, AlertTriangle, Lightbulb } from "lucide-react";
import { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip";

const CONFIG: Record<
  CalloutType,
  { icon: typeof Info; border: string; bg: string; iconColor: string }
> = {
  info: {
    icon: Info,
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/5",
    iconColor: "text-indigo-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    iconColor: "text-amber-400",
  },
  tip: {
    icon: Lightbulb,
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    iconColor: "text-green-400",
  },
};

export default function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const c = CONFIG[type];
  const Icon = c.icon;

  return (
    <div className={`my-6 rounded-xl border-l-4 ${c.border} ${c.bg} p-4 pl-5`}>
      <div className="flex gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${c.iconColor}`} />
        <div className="min-w-0">
          {title && <p className="font-semibold text-white mb-1">{title}</p>}
          <div className="text-sm text-white/70 leading-relaxed [&>p]:m-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
