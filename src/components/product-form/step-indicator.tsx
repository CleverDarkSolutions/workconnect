import { CheckIcon } from "lucide-react"

import { FORM_STEP_DETAILS } from "@/components/product-form/form-steps"
import { FORM_STEPS, type FormStep } from "@/lib/schemas/product-form"
import { cn } from "@/lib/utils"

type StepIndicatorProps = {
  currentStep: FormStep
}

type StepStatus = "complete" | "current" | "upcoming"

function statusOf(step: FormStep, currentStep: FormStep): StepStatus {
  if (step < currentStep) return "complete"
  return step === currentStep ? "current" : "upcoming"
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <ol
      aria-label="Kroki formularza"
      className="grid grid-cols-3 gap-2 border-b px-4 py-[15px] sm:flex sm:items-center sm:gap-4"
    >
      {FORM_STEPS.map((step, index) => {
        const status = statusOf(step, currentStep)
        const { title, description } = FORM_STEP_DETAILS[step]
        const isLast = index === FORM_STEPS.length - 1

        return (
          <li
            key={step}
            aria-current={status === "current" ? "step" : undefined}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
              <span
                aria-hidden
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                  status === "upcoming"
                    ? "border bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                {status === "complete" ? <CheckIcon className="size-4" /> : step}
              </span>
              <span className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-sm font-medium",
                    status === "upcoming" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  <span className="sr-only">Krok {step}: </span>
                  {title}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </span>
            </div>
            {!isLast && (
              <span
                aria-hidden
                className={cn(
                  "hidden h-px w-[67px] sm:block",
                  status === "complete" ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
