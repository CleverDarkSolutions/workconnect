"use client"

import type { ComponentProps } from "react"

import { useFieldErrors } from "@/components/product-form/fields/use-field-errors"
import { useFieldContext } from "@/components/product-form/form-context"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

type TextareaFieldProps = Pick<ComponentProps<"textarea">, "placeholder"> & {
  label: string
}

export function TextareaField({ label, ...textareaProps }: TextareaFieldProps) {
  const field = useFieldContext<string>()
  const errors = useFieldErrors()
  const errorId = `${field.name}-error`

  return (
    <Field data-invalid={errors.length > 0}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        {...textareaProps}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        aria-invalid={errors.length > 0}
        aria-describedby={errors.length > 0 ? errorId : undefined}
        className="min-h-16 resize-none"
      />
      <FieldError id={errorId} errors={errors} />
    </Field>
  )
}
