import { redirect } from "next/navigation";

// dash.fliq.sh hosts the dashboard only. The marketing homepage now lives on the
// standalone landing service (fliq.sh), so the root here always sends users into
// the app. (The middleware redirects `/` too; this is the belt-and-braces server
// fallback for any request that bypasses it.)
export default function Home() {
  redirect("/app");
}
