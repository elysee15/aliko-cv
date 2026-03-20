import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Créer un compte",
};
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Créer un compte"
      description="Entrez votre email et un mot de passe pour vous inscrire."
      footer={
        <p>
          Vous avez déjà un compte ?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthLayout>
  );
}
