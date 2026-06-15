import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  title: string;
};

export function AuthShell({ children, description, title }: AuthShellProps) {
  return (
    <main className="min-h-dvh bg-muted/40 px-4 py-8 sm:grid sm:place-items-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/login/" className="rounded-lg font-bold tracking-tight text-primary">
            iFin
          </Link>
          <ThemeToggle />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
