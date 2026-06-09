import { Suspense } from "react";
import JobsTable from "@/components/dashboard/JobsTable";

export default function JobsPage() {
  return (
    <Suspense>
      <JobsTable />
    </Suspense>
  );
}
