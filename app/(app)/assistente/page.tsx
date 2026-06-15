import { Sparkles } from "lucide-react";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export default function AssistantPage() {
  return (
    <ModulePlaceholder
      title="Assistente"
      description="A captura por linguagem natural está prevista para uma fase futura, após a definição de uma arquitetura segura para as credenciais da IA."
      icon={Sparkles}
    />
  );
}
