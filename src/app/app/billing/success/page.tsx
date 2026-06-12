import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <CheckCircle2 size={48} className="text-green-400" />
        <div>
          <h2 className="text-xl font-semibold">Credits Added!</h2>
          <p className="text-sm text-foreground/50 mt-1">
            Your credits have been added to your account.
          </p>
        </div>
        <Button asChild className="mt-2">
          <Link href="/app/billing">Back to Billing</Link>
        </Button>
      </div>
    </div>
  );
}
