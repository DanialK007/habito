'use client';

import { usePathname } from "next/navigation";
import MobileBottomNav from "@/components/MobileBottomNav";
import Sidebar from "@/components/Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="pt-4 flex-1 lg:pt-0">
        <div className="pb-16 lg:pb-0">
          {children}
        </div>
      </main>
      {pathname !== "/" && <MobileBottomNav />}
    </div>
  );
}