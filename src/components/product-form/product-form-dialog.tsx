"use client"

import { useStore } from "@tanstack/react-form"
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react"
import { useState, type ReactNode } from "react"

import { useAppForm } from "@/components/product-form/app-form"
import { AvailabilityStep } from "@/components/product-form/availability-step"
import { BasicInfoStep } from "@/components/product-form/basic-info-step"
import { LAST_STEP, nextStep, previousStep } from "@/components/product-form/form-steps"
import { PricingStep } from "@/components/product-form/pricing-step"
import { productFormOptions } from "@/components/product-form/product-form-options"
import { StepIndicator } from "@/components/product-form/step-indicator"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  productSchema,
  type ProductFormValues,
  type ProductInput,
} from "@/lib/schemas/product-form"
import { cn } from "@/lib/utils"

type FieldName = keyof ProductFormValues

type ProductFormDialogProps = {
  /** The "Dodaj produkt" button; wired as the dialog trigger so focus returns to it on close. */
  trigger: ReactNode
  onSubmit: (product: ProductInput) => void
}

export function ProductFormDialog({ trigger, onSubmit }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useAppForm({
    ...productFormOptions,
    // "Dalej" and "Zapisz produkt" both submit; the step-discriminated schema
    // decides which fields must be valid, so an invalid step never gets here.
    onSubmit: ({ value, formApi }) => {
      if (value.step < LAST_STEP) {
        formApi.setFieldValue("step", nextStep(value.step))
        return
      }
      onSubmit(productSchema.parse(value))
      setOpen(false)
    },
    // Reveal the errors of every field on the step, the way leaving each of
    // them would; fields are otherwise quiet while the user types.
    onSubmitInvalid: ({ formApi }) => {
      for (const name of Object.keys(formApi.state.fieldMeta) as FieldName[]) {
        formApi.setFieldMeta(name, (meta) => ({ ...meta, isBlurred: true }))
      }
    },
  })

  const step = useStore(form.store, (state) => state.values.step)
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)

  function handleOpenChange(nextOpen: boolean) {
    // Every session starts from a blank step 1, however the last one ended.
    // Resetting on open rather than on close keeps the closing dialog from
    // visibly snapping back to step 1.
    if (nextOpen) form.reset()
    setOpen(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none p-0 sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-[720px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
      >
        <DialogHeader className="flex h-16 shrink-0 flex-row items-center justify-between gap-0 border-b px-4">
          <DialogTitle>Dodaj nowy produkt</DialogTitle>
          <DialogDescription className="sr-only">
            Formularz dodawania produktu w trzech krokach.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="-mr-2 text-foreground/70">
              <XIcon />
              <span className="sr-only">Zamknij</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <StepIndicator currentStep={step} />

        <form
          noValidate
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {step === 1 && <BasicInfoStep form={form} />}
            {step === 2 && <PricingStep form={form} />}
            {step === 3 && <AvailabilityStep form={form} />}
          </div>

          <DialogFooter
            className={cn(
              "mx-0 mb-0 shrink-0 flex-row items-center rounded-none border-t bg-muted/50 p-4 sm:rounded-b-xl",
              step === 1 ? "justify-end sm:justify-end" : "justify-between sm:justify-between"
            )}
          >
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.setFieldValue("step", previousStep(step))}
              >
                <ArrowLeftIcon />
                Wstecz
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {step === LAST_STEP ? (
                "Zapisz produkt"
              ) : (
                <>
                  Dalej
                  <ArrowRightIcon />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
