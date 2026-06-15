import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <AuthShell title="Definir nova senha" description="Escolha uma nova senha para sua conta.">
      <UpdatePasswordForm />
    </AuthShell>
  );
}
