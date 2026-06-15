import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell title="Entrar" description="Acesse sua visão financeira consolidada.">
      <LoginForm />
    </AuthShell>
  );
}
