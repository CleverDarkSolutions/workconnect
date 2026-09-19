"use client"

import { useFieldContext } from "@/components/product-form/form-context"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

type SwitchFieldProps = {
  label: string
}

export function SwitchField({ label }: SwitchFieldProps) {
  const field = useFieldContext<boolean>()

  return (
    <Field orientation="horizontal">
      <Switch
        id={field.name}
        name={field.name}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
        onBlur={field.handleBlur}
      />
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
    </Field>
  )
}
