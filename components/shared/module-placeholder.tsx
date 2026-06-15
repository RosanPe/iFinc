import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function ModulePlaceholder({ title, description, icon: Icon }: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Módulo</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      </div>
      <Card>
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <span className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
            <Icon className="size-7" />
          </span>
          <h2 className="text-lg font-semibold">Base preparada</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
