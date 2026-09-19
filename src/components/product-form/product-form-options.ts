import { formOptions } from "@tanstack/react-form"

import {
  productFormDefaultValues,
  productFormSchema,
} from "@/lib/schemas/product-form"

/**
 * Shared between `useAppForm` in the dialog and `withForm` in each step so
 * the step components are typed against the same form instance.
 *
 * The schema runs on every change, so field errors are never stale; when an
 * error is *shown* is decided per field in `useFieldErrors`.
 */
export const productFormOptions = formOptions({
  defaultValues: productFormDefaultValues,
  validators: {
    onChange: productFormSchema,
  },
})
