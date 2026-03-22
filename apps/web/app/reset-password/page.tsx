import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
};

type PageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

function isInvalidTokenError(error: string | undefined): boolean {
  if (!error) return false;
  const n = error.toUpperCase().replace(/-/g, "_");
  return n === "INVALID_TOKEN" || n === "INVALIDTOKEN";
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (isInvalidTokenError(params.error)) {
    return (
      <AuthLayout
        title="Lien invalide"
        description="Ce lien de réinitialisation est invalide ou a expiré."
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
        <div className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Demandez un nouveau lien depuis la page dédiée.
          </p>
          <Link
            href="/forgot-password"
            className="text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Nouvelle demande de réinitialisation
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const token = params.token;
  if (!token) {
    return (
      <AuthLayout
        title="Lien incomplet"
        description="Ce lien ne contient pas les informations nécessaires pour réinitialiser votre mot de passe."
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
        <Link
          href="/forgot-password"
          className="block text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      description="Choisissez un mot de passe sécurisé. Il remplacera l’ancien une fois la validation effectuée."
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
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
