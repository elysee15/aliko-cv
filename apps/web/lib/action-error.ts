/**
 * Extracts the first meaningful error message from a next-safe-action error
 * object, checking serverError, then validation errors (form-level, then
 * field-level). Falls back to a generic French message.
 */
export function extractActionError(error: {
  serverError?: string;
  validationErrors?: Record<string, unknown>;
}): string {
  if (error.serverError) return error.serverError;

  if (error.validationErrors) {
    type FieldErrors = { _errors?: string[] };
    const ve = error.validationErrors as Record<string, FieldErrors | undefined>;
    const root = ve._errors as unknown as string[] | undefined;
    if (root?.[0]) return root[0];
    for (const [key, value] of Object.entries(ve)) {
      if (key === "_errors") continue;
      if (value?._errors?.[0]) return value._errors[0];
    }
  }

  return "Une erreur est survenue.";
}
