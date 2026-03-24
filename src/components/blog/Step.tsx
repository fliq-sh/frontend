import { ReactNode } from "react";

export default function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative my-8 pl-14">
      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-semibold text-sm border border-indigo-500/30">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
        <div className="text-white/70 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
