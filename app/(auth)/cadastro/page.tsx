import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthShell title="Criar conta" description="Seus dados serão isolados por autenticação e RLS.">
      <SignupForm />
    </AuthShell>
  );
}
