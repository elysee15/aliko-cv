import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="mb-8 inline-flex">
        <Button variant="ghost" size="sm">
          <ArrowLeftIcon />
          Retour
        </Button>
      </Link>

      <article className="prose prose-sm dark:prose-invert max-w-none">
        <h1>Politique de confidentialité</h1>
        <p>Dernière mise à jour : mars 2026</p>

        <h2>1. Responsable du traitement</h2>
        <p>
          Aliko CV est un projet open source. Les données sont traitées
          conformément au Règlement Général sur la Protection des Données (RGPD)
          et à la législation applicable.
        </p>

        <h2>2. Données collectées</h2>
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
        <ul>
          <li><strong>Compte utilisateur</strong> : nom, adresse email, mot de passe (hashé).</li>
          <li><strong>Contenu CV</strong> : titre, résumé, sections, entrées, coordonnées que vous saisissez.</li>
          <li><strong>Données techniques</strong> : adresse IP et user agent (pour la gestion des sessions).</li>
          <li><strong>Clés API</strong> : hashées (SHA-256), seul le préfixe est stocké en clair.</li>
        </ul>

        <h2>3. Finalités du traitement</h2>
        <ul>
          <li>Création et gestion de votre compte.</li>
          <li>Stockage et affichage de vos CV.</li>
          <li>Publication de votre CV via une URL publique (sur votre choix explicite).</li>
          <li>Authentification via clés API pour accès tiers (sur votre consentement).</li>
        </ul>

        <h2>4. Base légale</h2>
        <p>
          Le traitement repose sur votre <strong>consentement</strong> (inscription,
          publication de CV) et sur l&apos;exécution du <strong>contrat de service</strong>
          (fonctionnement de l&apos;application).
        </p>

        <h2>5. Durée de conservation</h2>
        <p>
          Vos données sont conservées tant que votre compte est actif.
          Lors de la suppression du compte, toutes les données sont
          supprimées immédiatement et de manière irréversible (cascade).
        </p>

        <h2>6. Vos droits (RGPD)</h2>
        <p>Vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Accès et portabilité</strong> : exportez toutes vos données au format JSON depuis les Paramètres.</li>
          <li><strong>Rectification</strong> : modifiez vos informations directement dans l&apos;éditeur ou les Paramètres.</li>
          <li><strong>Suppression</strong> : supprimez votre compte et toutes vos données depuis les Paramètres.</li>
          <li><strong>Opposition et limitation</strong> : contactez-nous pour exercer ces droits.</li>
        </ul>

        <h2>7. Partage des données</h2>
        <p>
          Vos données ne sont pas vendues ni partagées avec des tiers à des fins
          commerciales. Les CV publiés sont accessibles via leur URL publique,
          uniquement sur votre choix.
        </p>

        <h2>8. Sécurité</h2>
        <ul>
          <li>Communications chiffrées via HTTPS (TLS).</li>
          <li>Mots de passe hashés (bcrypt).</li>
          <li>Clés API hashées (SHA-256).</li>
          <li>Isolation stricte des données par utilisateur.</li>
        </ul>

        <h2>9. Cookies</h2>
        <p>
          Aliko CV utilise uniquement des cookies techniques nécessaires
          au fonctionnement (session d&apos;authentification, préférence de thème).
          Aucun cookie publicitaire ou de suivi n&apos;est utilisé.
        </p>

        <h2>10. Contact</h2>
        <p>
          Pour toute question relative à vos données personnelles,
          contactez-nous à l&apos;adresse indiquée sur le dépôt du projet.
        </p>
      </article>
    </div>
  );
}
