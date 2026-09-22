"use client"

import type { ComponentProps } from "react"

import { useFieldErrors } from "@/components/product-form/fields/use-field-errors"
import { useFieldContext } from "@/components/product-form/form-context"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type TextFieldProps = Pick<ComponentProps<"input">, "placeholder" | "inputMode"> & {
  label: string
  onValueChange?: (value: string) => void
}

export function TextField({ label, onValueChange, ...inputProps }: TextFieldProps) {
  const field = useFieldContext<string>()
  const errors = useFieldErrors()
  const errorId = `${field.name}-error`

  return (
    <Field data-invalid={errors.length > 0}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        {...inputProps}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => {
          field.handleChange(event.target.value)
          onValueChange?.(event.target.value)
        }}
        aria-invalid={errors.length > 0}
        aria-describedby={errors.length > 0 ? errorId : undefined}
      />
      <FieldError id={errorId} errors={errors} />
    </Field>
  )
}
