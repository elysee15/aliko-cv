"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ScanSearchIcon,
  Loader2Icon,
  CheckCircleIcon,
  AlertCircleIcon,
  LightbulbIcon,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

type AtsResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  tips: string[];
};

type Props = {
  resumeId: string;
};

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70
      ? "text-green-500"
      : score >= 40
        ? "text-amber-500"
        : "text-red-500";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-700`}
        />
      </svg>
      <span className={`absolute text-2xl font-bold ${color}`}>{score}%</span>
    </div>
  );
}

export function AtsAnalyzer({ resumeId }: Props) {
  const [open, setOpen] = useState(false);
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);

  async function handleAnalyze() {
    if (jobText.trim().length < 20) {
      toast.error("Collez au moins 20 caractères de l'offre d'emploi.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/resume/${resumeId}/ats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jobText }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur lors de l'analyse.");
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setJobText("");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { handleReset(); } }}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <ScanSearchIcon />
            ATS
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analyse ATS</DialogTitle>
          <DialogDescription>
            Collez le texte d&apos;une offre d&apos;emploi pour évaluer la compatibilité de votre CV.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <Textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Collez ici le texte de l'offre d'emploi…"
              rows={8}
              className="resize-none"
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading || jobText.trim().length < 20}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Analyse en cours…
                </>
              ) : (
                <>
                  <ScanSearchIcon />
                  Analyser
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Score */}
            <div className="flex flex-col items-center gap-2 py-2">
              <ScoreRing score={result.score} />
              <p className="text-sm font-medium">
                {result.score >= 70
                  ? "Bonne compatibilité"
                  : result.score >= 40
                    ? "Compatibilité moyenne"
                    : "Compatibilité faible"}
              </p>
            </div>

            {/* Matched keywords */}
            {result.matchedKeywords.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="size-4" />
                  Mots-clés trouvés ({result.matchedKeywords.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchedKeywords.slice(0, 20).map((kw) => (
                    <Badge key={kw} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing keywords */}
            {result.missingKeywords.length > 0 && (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
                  <AlertCircleIcon className="size-4" />
                  Mots-clés manquants ({result.missingKeywords.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingKeywords.slice(0, 15).map((kw) => (
                    <Badge key={kw} variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="space-y-2 rounded-none border bg-muted/40 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <LightbulbIcon className="size-4 text-primary" />
                  Conseils
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {result.tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button variant="outline" onClick={handleReset} className="w-full">
              Nouvelle analyse
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
