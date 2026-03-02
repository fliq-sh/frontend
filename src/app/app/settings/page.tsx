import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Placeholder API key section */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h3 className="font-medium mb-1">API Key</h3>
        <p className="text-sm text-white/40 mb-4">
          Use your Clerk JWT to authenticate API requests. Key management coming soon.
        </p>
        <code className="block rounded-md bg-black/40 border border-white/10 px-4 py-2 text-xs text-white/60 font-mono">
          Authorization: Bearer &lt;your-clerk-jwt&gt;
        </code>
      </div>

      {/* Clerk profile */}
      <div>
        <h3 className="font-medium mb-4">Account</h3>
        <UserProfile routing="hash" />
      </div>
    </div>
  );
}
