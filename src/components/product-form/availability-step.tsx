"use client"

import { withForm } from "@/components/product-form/app-form"
import { productFormOptions } from "@/components/product-form/product-form-options"

export const AvailabilityStep = withForm({
  ...productFormOptions,
  render: function AvailabilityStep({ form }) {
    return (
      <div className="flex flex-col divide-y">
        <div className="pb-4">
          <form.AppField name="isAvailable">
            {(field) => <field.SwitchField label="Produkt jest dostępny" />}
          </form.AppField>
        </div>
        <div className="flex flex-col gap-4 py-4">
          <form.AppField name="isLimited">
            {(field) => (
              <field.CheckboxField
                label="Produkt limitowany"
                onValueChange={(isLimited) => {
                  // The stock field is hidden when unchecked, so drop its value and
                  // any error it may hold instead of letting it block submission.
                  if (!isLimited) form.resetField("stockQuantity")
                }}
              />
            )}
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.isLimited}>
            {(isLimited) =>
              isLimited && (
                <form.AppField name="stockQuantity">
                  {(field) => (
                    <field.TextField
                      label="Ilość na magazynie"
                      placeholder="np. 120"
                      inputMode="numeric"
                    />
                  )}
                </form.AppField>
              )
            }
          </form.Subscribe>
        </div>
        <div className="flex flex-col gap-4 pt-5">
          <h3 className="text-base font-medium">Limity koszyka</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="minCartQuantity">
              {(field) => <field.TextField label="Minimalna ilość" inputMode="numeric" />}
            </form.AppField>
            <form.AppField name="maxCartQuantity">
              {(field) => <field.TextField label="Maksymalna ilość" inputMode="numeric" />}
            </form.AppField>
          </div>
        </div>
      </div>
    )
  },
})
