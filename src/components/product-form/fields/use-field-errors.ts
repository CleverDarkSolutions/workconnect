import { useStore, type StandardSchemaV1Issue } from "@tanstack/react-form"

import { useFieldContext } from "@/components/product-form/form-context"

/**
 * Errors of the current field, shown once the user has edited it and left it
 * — never while they are still typing. A blocked "Dalej" marks the step's
 * fields as blurred, which reveals errors for the ones they skipped.
 *
 * The explicit return type keeps the errors typed: the schema is the form's
 * only validator, so they are always Standard Schema issues, which the
 * untyped field context would otherwise widen to `any`.
 */
export function useFieldErrors(): StandardSchemaV1Issue[] {
  const field = useFieldContext()

  return useStore(field.store, ({ meta }) =>
    meta.isTouched && meta.isBlurred ? meta.errors : []
  )
}
