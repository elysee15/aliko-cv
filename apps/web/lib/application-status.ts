import type { ApplicationStatus } from "@aliko-cv/db/queries";

export const APPLICATION_STATUSES: {
  value: ApplicationStatus;
  label: string;
  color: string;
  bgClass: string;
}[] = [
  {
    value: "wishlist",
    label: "Wishlist",
    color: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    value: "applied",
    label: "Postulé",
    color: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  {
    value: "interview",
    label: "Entretien",
    color: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  {
    value: "offer",
    label: "Offre",
    color: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  {
    value: "rejected",
    label: "Refusé",
    color: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
  {
    value: "archived",
    label: "Archivé",
    color: "text-gray-500 dark:text-gray-400",
    bgClass: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
];

export function getStatusConfig(status: ApplicationStatus) {
  return APPLICATION_STATUSES.find((s) => s.value === status) ?? APPLICATION_STATUSES[0]!;
}
