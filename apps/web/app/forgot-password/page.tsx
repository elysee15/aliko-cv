import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Indiquez votre email. Si un compte existe, vous recevrez un lien pour choisir un nouveau mot de passe."
      footer={
        <p>
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
