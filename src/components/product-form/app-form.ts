import { createFormHook } from "@tanstack/react-form"

import { CheckboxField } from "@/components/product-form/fields/checkbox-field"
import { SelectField } from "@/components/product-form/fields/select-field"
import { SwitchField } from "@/components/product-form/fields/switch-field"
import { TextField } from "@/components/product-form/fields/text-field"
import { TextareaField } from "@/components/product-form/fields/textarea-field"
import { ToggleGroupField } from "@/components/product-form/fields/toggle-group-field"
import { fieldContext, formContext } from "@/components/product-form/form-context"

/**
 * `form.AppField` exposes the shadcn-based field components below as
 * `field.TextField`, `field.SelectField`, … so each step stays declarative.
 */
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    ToggleGroupField,
    SwitchField,
    CheckboxField,
  },
  formComponents: {},
})
