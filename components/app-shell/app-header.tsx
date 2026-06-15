"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.replace("/login/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">iFin</p>
          <p className="text-sm font-semibold">Sua vida financeira</p>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            aria-label={`Sair${user?.email ? ` da conta ${user.email}` : ""}`}
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
