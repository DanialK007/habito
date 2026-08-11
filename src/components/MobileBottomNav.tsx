"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Calendar, Star, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/habits", icon: Calendar, label: "Habits" },
    { href: "/favorites", icon: Star, label: "Favorites" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  const activeIndex = navItems.findIndex(item => item.href === pathname);

  useEffect(() => {
    if (activeIndex !== -1 && navRefs.current[activeIndex]) {
      const navItem = navRefs.current[activeIndex];
      const parent = navItem.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const itemRect = navItem.getBoundingClientRect();
        setIndicatorStyle({
          left: itemRect.left - parentRect.left - 4,
          width: itemRect.width,
        });
      }
    }
  }, [activeIndex, pathname]);

  if (pathname === "/") return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-2 w-full">
      <div className="bg-neutral-50/75 backdrop-blur-xs rounded-full border border-neutral-200 z-50 pb-safe">
        <div className="flex items-center justify-around px-2 py-2 relative">
          {/* Sliding indicator */}
          <div
            className="absolute -z-10 bottom-1 w-22 h-16 border border-neutral-200 bg-white/80 rounded-full transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
            }}
          />
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={(el) => { navRefs.current[index] = el; }}
                className={`flex flex-col w-20 h-14 justify-center items-center gap-1 rounded-full transition-colors ${
                  isActive
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-orange-500"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}