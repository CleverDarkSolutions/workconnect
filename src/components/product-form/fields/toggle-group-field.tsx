"use client"

import { useFieldErrors } from "@/components/product-form/fields/use-field-errors"
import { useFieldContext } from "@/components/product-form/form-context"
import { Field, FieldError, FieldTitle } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type ToggleGroupFieldProps = {
  label: string
  options: readonly string[]
}

/** Multi-select rendered as a row of chips (the "Cechy produktu" control). */
export function ToggleGroupField({ label, options }: ToggleGroupFieldProps) {
  const field = useFieldContext<string[]>()
  const errors = useFieldErrors()
  const labelId = `${field.name}-label`
  const errorId = `${field.name}-error`

  return (
    <Field data-invalid={errors.length > 0}>
      <FieldTitle id={labelId}>{label}</FieldTitle>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="chip"
        value={field.state.value}
        onValueChange={field.handleChange}
        onBlur={field.handleBlur}
        aria-labelledby={labelId}
        aria-invalid={errors.length > 0}
        aria-describedby={errors.length > 0 ? errorId : undefined}
        className="flex-wrap"
      >
        {options.map((option) => (
          <ToggleGroupItem key={option} value={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldError id={errorId} errors={errors} />
    </Field>
  )
}
