import type { FormStep } from "@/lib/schemas/product-form"

export const LAST_STEP: FormStep = 3

export const FORM_STEP_DETAILS: Record<FormStep, { title: string; description: string }> = {
  1: { title: "Informacje", description: "Dane podstawowe" },
  2: { title: "Cena", description: "Dane cenowe" },
  3: { title: "Dostępność", description: "Stany magazynowe" },
}

const NEXT_STEP: Record<FormStep, FormStep> = { 1: 2, 2: 3, 3: 3 }
const PREVIOUS_STEP: Record<FormStep, FormStep> = { 1: 1, 2: 1, 3: 2 }

export const nextStep = (step: FormStep): FormStep => NEXT_STEP[step]
export const previousStep = (step: FormStep): FormStep => PREVIOUS_STEP[step]
