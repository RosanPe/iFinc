import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function FloatingActionButton() {
  return (
    <Button asChild size="icon" className="fixed bottom-20 right-4 z-40 size-14 rounded-full shadow-lg shadow-primary/25 sm:right-6">
      <Link href="/financas/" aria-label="Adicionar lançamento">
        <Plus className="size-6" />
      </Link>
    </Button>
  );
}
