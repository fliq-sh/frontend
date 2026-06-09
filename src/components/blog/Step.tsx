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
      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white font-semibold text-sm border border-white/20">
        {number}
      </div>
      <div>
        <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
        <div className="text-white/70 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
