import { AuthShell } from "@/components/auth/auth-shell";
import { RecoveryForm } from "@/components/auth/recovery-form";

export default function RecoveryPage() {
  return (
    <AuthShell title="Recuperar senha" description="Informe o e-mail usado no cadastro.">
      <RecoveryForm />
    </AuthShell>
  );
}
