"use client"

import { withForm } from "@/components/product-form/app-form"
import { productFormOptions } from "@/components/product-form/product-form-options"
import {
  CATEGORIES,
  MANUFACTURERS,
  PRODUCT_FEATURES,
} from "@/lib/products/product-options"

const MANUFACTURER_OPTIONS = MANUFACTURERS.map((value) => ({ value, label: value }))
const CATEGORY_OPTIONS = CATEGORIES.map((value) => ({ value, label: value }))

export const BasicInfoStep = withForm({
  ...productFormOptions,
  render: function BasicInfoStep({ form }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="name">
          {(field) => (
            <field.TextField label="Nazwa produktu" placeholder="np. MacBook Pro 14" />
          )}
        </form.AppField>
        <form.AppField name="sku">
          {(field) => <field.TextField label="SKU produktu" placeholder="np. MBP14M3PRO" />}
        </form.AppField>
        <div className="sm:col-span-2">
          <form.AppField name="description">
            {(field) => <field.TextareaField label="Opis" placeholder="Krótki opis produktu" />}
          </form.AppField>
        </div>
        <form.AppField name="manufacturer">
          {(field) => (
            <field.SelectField
              label="Producent"
              placeholder="Wybierz producenta"
              options={MANUFACTURER_OPTIONS}
            />
          )}
        </form.AppField>
        <form.AppField name="category">
          {(field) => (
            <field.SelectField
              label="Kategoria"
              placeholder="Wybierz kategorię"
              options={CATEGORY_OPTIONS}
            />
          )}
        </form.AppField>
        <div className="sm:col-span-2">
          <form.AppField name="features">
            {(field) => (
              <field.ToggleGroupField label="Cechy produktu" options={PRODUCT_FEATURES} />
            )}
          </form.AppField>
        </div>
      </div>
    )
  },
})
