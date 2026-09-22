"use client"

import { useFieldErrors } from "@/components/product-form/fields/use-field-errors"
import { useFieldContext } from "@/components/product-form/form-context"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectOption = { value: string; label: string }

type SelectFieldProps = {
  label: string
  placeholder?: string
  options: readonly SelectOption[]
  onValueChange?: (value: string) => void
}

export function SelectField({ label, placeholder, options, onValueChange }: SelectFieldProps) {
  const field = useFieldContext<string>()
  const errors = useFieldErrors()
  const errorId = `${field.name}-error`

  return (
    <Field data-invalid={errors.length > 0}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(value)
          onValueChange?.(value)
        }}
      >
        <SelectTrigger
          id={field.name}
          onBlur={field.handleBlur}
          aria-invalid={errors.length > 0}
          aria-describedby={errors.length > 0 ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id={errorId} errors={errors} />
    </Field>
  )
}
