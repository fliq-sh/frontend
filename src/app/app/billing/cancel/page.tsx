import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <XCircle size={48} className="text-foreground/60" />
        <div>
          <h2 className="text-xl font-semibold">Checkout Cancelled</h2>
          <p className="text-sm text-foreground/68 mt-1">No charges were made.</p>
        </div>
        <Button asChild variant="outline" className="mt-2 border-foreground/10 hover:bg-foreground/5">
          <Link href="/app/billing">Back to Billing</Link>
        </Button>
      </div>
    </div>
  );
}
