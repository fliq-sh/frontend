export default function AuthorCard({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 py-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-semibold text-sm border border-indigo-500/30">
        {initials}
      </div>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-sm text-white/40">Fliq team</p>
      </div>
    </div>
  );
}
