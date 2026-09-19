import { useStore, type StandardSchemaV1Issue } from "@tanstack/react-form"

import { useFieldContext } from "@/components/product-form/form-context"

/**
 * Errors of the current field, shown once the user has edited it and either
 * left it or tried to move on with "Dalej" — never while they are still
 * typing their first value.
 *
 * The form's only validator is the Zod schema, so every error is a Standard
 * Schema issue — the return type pins that down where TanStack's untyped
 * field context would otherwise widen it to `any`.
 */
export function useFieldErrors(): StandardSchemaV1Issue[] {
  const field = useFieldContext()
  const submitAttempted = useStore(field.form.store, (state) => state.submissionAttempts > 0)

  return useStore(field.store, ({ meta }) =>
    meta.isTouched && (meta.isBlurred || submitAttempted) ? meta.errors : []
  )
}
