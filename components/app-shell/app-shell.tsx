import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { BottomNavigation } from "@/components/app-shell/bottom-navigation";
import { FloatingActionButton } from "@/components/app-shell/floating-action-button";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh min-w-0 overflow-x-clip bg-background text-foreground">
      <a href="#main-content" className="fixed left-4 top-2 z-[60] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:translate-y-0">Pular para o conteúdo</a>
      <AppHeader />
      <main id="main-content" className="mx-auto min-w-0 w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6">{children}</main>
      <FloatingActionButton />
      <BottomNavigation />
    </div>
  );
}
