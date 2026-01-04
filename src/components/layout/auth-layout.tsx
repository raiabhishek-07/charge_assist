import Link from "next/link";
import { Zap } from "lucide-react";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline">ChargeAssist</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
