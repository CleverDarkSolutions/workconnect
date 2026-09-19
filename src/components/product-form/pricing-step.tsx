"use client"

import { withForm } from "@/components/product-form/app-form"
import { productFormOptions } from "@/components/product-form/product-form-options"
import { deriveGrossInput, deriveNetInput } from "@/lib/price"
import { CURRENCIES, VAT_RATES } from "@/lib/products/product-options"

const VAT_OPTIONS = VAT_RATES.map((value) => ({ value, label: `${value}%` }))
const CURRENCY_OPTIONS = CURRENCIES.map((value) => ({ value, label: value }))

/**
 * Step 2 — Cena. Net and gross are linked: editing one derives the other
 * from the VAT rate, and changing the VAT rate re-derives gross from net.
 * Each handler writes exactly one other field, so there is no update loop.
 */
export const PricingStep = withForm({
  ...productFormOptions,
  render: function PricingStep({ form }) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="priceNet">
          {(field) => (
            <field.TextField
              label="Cena netto"
              placeholder="0.00"
              inputMode="decimal"
              onValueChange={(net) =>
                form.setFieldValue(
                  "priceGross",
                  deriveGrossInput(net, form.getFieldValue("vatRate"))
                )
              }
            />
          )}
        </form.AppField>
        <form.AppField name="priceGross">
          {(field) => (
            <field.TextField
              label="Cena brutto"
              placeholder="0.00"
              inputMode="decimal"
              onValueChange={(gross) =>
                form.setFieldValue(
                  "priceNet",
                  deriveNetInput(gross, form.getFieldValue("vatRate"))
                )
              }
            />
          )}
        </form.AppField>
        <form.AppField name="vatRate">
          {(field) => (
            <field.SelectField
              label="Stawka VAT"
              options={VAT_OPTIONS}
              onValueChange={(vatRate) =>
                form.setFieldValue(
                  "priceGross",
                  deriveGrossInput(form.getFieldValue("priceNet"), vatRate)
                )
              }
            />
          )}
        </form.AppField>
        <form.AppField name="currency">
          {(field) => <field.SelectField label="Waluta" options={CURRENCY_OPTIONS} />}
        </form.AppField>
      </div>
    )
  },
})
