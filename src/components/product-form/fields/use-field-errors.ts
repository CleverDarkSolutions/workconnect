import { useStore, type StandardSchemaV1Issue } from "@tanstack/react-form"

import { useFieldContext } from "@/components/product-form/form-context"

/**
 * Errors of the current field, shown once the user has edited it and left it
 * — never while they are still typing. A failed "Dalej" marks every field of
 * the step as blurred (see the dialog's `onSubmitInvalid`), which is what
 * reveals errors for fields the user skipped.
 *
 * The form's only validator is the Zod schema, so every error is a Standard
 * Schema issue — the return type pins that down where TanStack's untyped
 * field context would otherwise widen it to `any`.
 */
export function useFieldErrors(): StandardSchemaV1Issue[] {
  const field = useFieldContext()

  return useStore(field.store, ({ meta }) =>
    meta.isTouched && meta.isBlurred ? meta.errors : []
  )
}
