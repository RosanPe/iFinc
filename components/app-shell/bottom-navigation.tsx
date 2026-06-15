"use client";

import { Bot, ChartNoAxesCombined, House, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard/", label: "Início", icon: House },
  { href: "/financas/", label: "Finanças", icon: WalletCards },
  { href: "/investimentos/", label: "Investir", icon: ChartNoAxesCombined },
  { href: "/assistente/", label: "Assistente", icon: Bot },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:left-1/2 md:max-w-xl md:-translate-x-1/2 md:rounded-t-2xl md:border-x"
    >
      <div className="grid h-16 grid-cols-4">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href.slice(0, -1));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active && "text-primary",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
