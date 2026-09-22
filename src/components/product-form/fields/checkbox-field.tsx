"use client"

import { useFieldContext } from "@/components/product-form/form-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"

type CheckboxFieldProps = {
  label: string
  onValueChange?: (checked: boolean) => void
}

export function CheckboxField({ label, onValueChange }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>()

  return (
    <Field orientation="horizontal">
      <Checkbox
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={(checked) => {
          const next = checked === true
          field.handleChange(next)
          onValueChange?.(next)
        }}
        onBlur={field.handleBlur}
      />
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
    </Field>
  )
}
