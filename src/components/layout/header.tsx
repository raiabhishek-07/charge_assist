"use client";

import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserNav } from "@/components/layout/user-nav"
import Link from "next/link"
import { Zap } from "lucide-react"
import { AdminNotifications } from "./admin-notifications";
import { usePathname } from "next/navigation";


export function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <Link href="/dashboard" className="flex items-center gap-2 font-bold font-headline">
          <Zap className="h-6 w-6 text-primary" />
          <span>ChargeAssist</span>
        </Link>
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        {isAdminPage && <AdminNotifications />}
        <UserNav />
      </div>
    </header>
  )
}
