# Wieloetapowy formularz dodawania produktu

Zadanie rekrutacyjne WorkConnect — trzyetapowy formularz dodawania produktu w oknie
modalnym, walidowany krok po kroku, zasilający tabelę produktów z paginacją
zsynchronizowaną z adresem URL.

**Demo:** https://workconnect-product-form.vercel.app
**Repozytorium:** https://github.com/CleverDarkSolutions/workconnect

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript (strict)
- [shadcn/ui](https://ui.shadcn.com) (preset Radix / Nova, Geist, Lucide) + Tailwind CSS 4
- [TanStack Form](https://tanstack.com/form) — stan formularza i obsługa kroków
- [Zod 4](https://zod.dev) — schematy walidacji każdego kroku
- [nuqs](https://nuqs.dev) — numer strony tabeli w parametrach URL
- Vitest (logika i schematy) + Playwright (scenariusze end-to-end)

## Uruchomienie

Wymagany Node.js 20+ i npm.

```bash
npm install
npm run dev        # serwer deweloperski: http://localhost:3000
npm run build      # build produkcyjny
npm run start      # serwer produkcyjny (po build)
```

Kontrola jakości:

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run test       # testy jednostkowe (Vitest): cena, schematy Zod, paginacja, formatowanie
npm run test:e2e   # testy Playwright (desktop + mobile); same budują i uruchamiają aplikację
```

Przed pierwszym `npm run test:e2e` należy pobrać przeglądarkę:
`npx playwright install chromium`.

Ten sam zestaw testów można uruchomić przeciwko wdrożonej wersji:

```bash
npx playwright test -c playwright.prod.config.ts          # domyślnie link z sekcji Demo
E2E_BASE_URL=https://… npx playwright test -c playwright.prod.config.ts
```

## Struktura

```
src/
├── app/                          # layout (NuqsAdapter, Toaster, Geist) i strona główna
├── components/
│   ├── product-form/
│   │   ├── product-form-dialog.tsx   # Dialog, instancja formularza, nawigacja Dalej / Wstecz
│   │   ├── basic-info-step.tsx       # krok 1 — Informacje podstawowe
│   │   ├── pricing-step.tsx          # krok 2 — Cena (przeliczanie netto / brutto / VAT)
│   │   ├── availability-step.tsx     # krok 3 — Dostępność i stany magazynowe
│   │   ├── step-indicator.tsx        # wskaźnik kroków
│   │   ├── app-form.ts               # createFormHook: useAppForm / withForm + komponenty pól
│   │   ├── product-form-options.ts   # wspólne formOptions (wartości domyślne, walidator)
│   │   └── fields/                   # TextField, SelectField, ToggleGroupField, Switch, Checkbox
│   ├── products/                     # tabela (desktop), karty (mobile), paginacja, badge
│   └── ui/                           # komponenty shadcn/ui dostrojone do Figmy
└── lib/
    ├── schemas/product-form.ts   # schematy Zod: kroki 1–3, schemat formularza, schemat produktu
    ├── price.ts                  # czysta arytmetyka netto / brutto / VAT
    ├── format.ts                 # formatowanie cen, stanów i liczebników
    └── products/                 # typ produktu, dane mockowe, pomocnicze funkcje paginacji
e2e/                              # scenariusze Playwright
```

## Jak to działa

### Jedna instancja formularza, schemat rozróżniany po kroku

Cały formularz to jedna instancja TanStack Form (`useAppForm`); każdy krok jest osobnym
komponentem `withForm`, więc powrót „Wstecz" niczego nie resetuje. Numer bieżącego kroku
jest częścią stanu formularza (`step`), dzięki czemu jedno `form.reset()` cofa również do
kroku 1. Reset wykonuje się przy każdym otwarciu dialogu — każda sesja zaczyna od pustego
kroku 1 niezależnie od tego, jak zakończyła się poprzednia (X, Escape, kliknięcie tła,
zapis), a zamykająca się animacja nie „przeskakuje" na krok 1.

Walidatorem formularza jest `productFormSchema` — `z.discriminatedUnion("step", …)`
złożony z trzech schematów krokowych (`basicInfoSchema`, `pricingSchema`,
`availabilitySchema`). Wariant dla kroku *n* sprawdza pola kroków 1…*n*, więc:

- „Dalej" i „Zapisz produkt" to to samo `form.handleSubmit()` — TanStack Form nie wywoła
  `onSubmit`, dopóki bieżący krok nie jest poprawny,
- błędy schematu trafiają do konkretnych pól (Standard Schema → `field.state.meta.errors`)
  i są wyświetlane obok nich przez shadcn `FieldError`,
- w kroku 3 waliduje się całość, a `productSchema.parse(values)` zamienia wartości
  formularza (stringi z inputów) na typowany produkt (`z.output`), który trafia do tabeli.

Błąd pola pokazuje się po opuszczeniu pola lub po pierwszej próbie przejścia dalej — nie w
trakcie wpisywania pierwszej wartości. Sama walidacja biegnie przy każdej zmianie, więc
komunikaty nigdy nie są nieaktualne.

### Netto / brutto / VAT

`brutto = netto × (1 + VAT / 100)`. Edycja netto wylicza brutto, edycja brutto wylicza
netto, a **zmiana stawki VAT zawsze przelicza brutto na podstawie netto** (treść zadania
zostawia wybór „brutto lub netto"; wybrałem jedną deterministyczną regułę). Każdy handler
zapisuje dokładnie jedno pole, więc nie ma pętli aktualizacji. Obliczenia idą na pełnych
groszach (`lib/price.ts`), więc przypadki „pół grosza" (12,50 × 1,23 = 15,375 → 15,38)
zaokrąglają się dokładnie, a nie przez ułamki binarne — pokryte testami, łącznie z
własnością netto → brutto → netto dla każdej stawki.

### Warunkowe pole „Ilość na magazynie"

Pole jest renderowane tylko przy zaznaczonym „Produkt limitowany" (`form.Subscribe`),
a wymagane tylko wtedy — reguła siedzi w `superRefine` schematu kroku 3, razem z warunkiem
min ≤ max dla limitów koszyka (błąd wyświetlany przy obu polach). Odznaczenie checkboxa
wywołuje `form.resetField("stockQuantity")`, żeby ukryte pole nie blokowało zapisu
nieaktualnym błędem.

### Tabela i paginacja

Numer strony żyje w URL (`?page=2`) przez `useQueryState` z nuqs — odświeżenie strony i
bezpośredni link zachowują widok, a wartość spoza zakresu jest przycinana do ostatniej
strony. Nowy produkt trafia na koniec katalogu; widok pozostaje na bieżącej stronie
i pojawia się toast „Produkt został dodany" (jak na makiecie).

## Założenia i decyzje

- **Pola wymagane w kroku 1.** Treść zadania oznacza jako opcjonalny tylko „Opis", więc
  „Producent", „Kategoria" i „Cechy produktu" (co najmniej jedna) są wymagane.
- **Dane startowe.** Zadanie mówi o 5 produktach, a makieta pokazuje „Strona 1 z 2 ·
  7 produktów". Katalog startuje z 5 produktami z Figmy + 2 dodatkowymi, żeby paginacja
  była od razu widoczna i testowalna (5 wierszy na stronę, jak na makiecie).
- **Etykieta opisu.** W Figmie pole opisu ma etykietę „Nazwa produktu" (powielona);
  użyłem „Opis" zgodnie z treścią zadania.
- **VAT jako Select.** Makieta rysuje stawkę VAT jako zwykłe pole z wartością „23%";
  zadanie wymaga `Select`, więc jest to `Select` (23%, 8%, 5%, 0%).
- **Liczby w inputach.** Kwoty przyjmują przecinek lub kropkę („12,50" i „12.50") i
  maksymalnie dwa miejsca po przecinku — zapisywane jest dokładnie to, co wpisano, bez
  cichego zaokrąglania. Ilości muszą być nieujemnymi liczbami całkowitymi. Kwoty i ilości
  mają górny limit (999 999 999,99 / 999 999 999), żeby każda zapisana liczba mieściła się
  w dokładnej precyzji `number`.
- **Mobile.** Makieta zawiera również wersję mobilną (karty zamiast tabeli, dialog na
  pełnym ekranie) — jest zaimplementowana i objęta testami e2e.
