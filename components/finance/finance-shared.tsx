import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MonthInput({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  return <Input id={id} type="month" value={value.slice(0, 7)} onChange={(event) => onChange(`${event.target.value}-01`)} />;
}

export function Field({ children, htmlFor, label }: { children: ReactNode; htmlFor: string; label: string }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}

export function SectionCard({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}</CardHeader><CardContent>{children}</CardContent></Card>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{children}</div>;
}
