import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Connexion"
      description="Entrez votre email et votre mot de passe pour vous connecter."
      footer={
        <>
          <p>
            <Link
              href="/forgot-password"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </p>
          <p>
            Vous n&apos;avez pas de compte ?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </>
      }
    >
      <SignInForm />
    </AuthLayout>
  );
}
