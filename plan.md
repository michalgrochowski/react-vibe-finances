# Vibe Finances – Step-by-step Delivery Plan

A Next.js (App Router) app to track monthly salary, expenses, and savings with authentication, theming, and a donut chart per month.

---

## 0) Scope and success criteria

- Authenticated users can:
  - Log in/out, change password, delete account.
  - Navigate months (prev/next), with a configurable tracking start month.
  - Set a default monthly salary and recurring expenses (auto-applied each month).
  - Override this month’s salary, add/remove one-off expenses.
  - See a live-updating donut chart that reflects expenses vs salary remainder.
  - Track savings, set and name goals; savings shown on a dedicated tab.
  - Toggle light/dark/system theme.
- Performance: instant UX with optimistic updates; server is source of truth.
- Security: row-level isolation per user; no cross-tenant data exposure.
- Accessibility: keyboard nav, ARIA for chart labels, color-contrast for themes.
- Tests: unit for logic, integration for API routes, basic e2e for happy path.

---

## 1) Tech choices

- Framework: Next.js 14+ (App Router, TypeScript).
- UI: Material UI (MUI) with Emotion (`@mui/material`, `@emotion/react`, `@emotion/styled`).
- State/data: TanStack Query (client), Server Actions and Route Handlers (server).
- Charts: Recharts donut chart.
- Auth + DB:
  - Primary: NextAuth + Prisma on PostgreSQL (self-hosted on your server).
  - Alternative: Supabase (Postgres + Auth) if you later prefer managed auth.
- Validation: Zod.
- Tooling: ESLint, Prettier, Vitest, Playwright (or Cypress) for e2e.

---

## 2) Data model (PostgreSQL + Prisma schema)

- Guiding principles:
  - All money stored as `BIGINT` cents to avoid floating-point errors.
  - User isolation via foreign keys to `users.id` and filtered queries by `user_id`.
  - Composite unique/indexes for hot paths and pagination.

- Tables:
  - `users`:
    - `id UUID PK`, `username CITEXT UNIQUE`, `email CITEXT UNIQUE`, `email_verified TIMESTAMPTZ NULL`, `hashed_password TEXT NULL` (if using credentials), timestamps.
  - `profiles`:
    - `user_id UUID PK/FK -> users(id)`, `display_name TEXT`, `theme_pref TEXT CHECK(theme_pref IN ('light','dark','system')) DEFAULT 'system'`, `default_salary_cents BIGINT NOT NULL DEFAULT 0`, `first_tracked_month DATE NOT NULL`, timestamps.
  - `budget_months`:
    - `id UUID PK`, `user_id UUID FK -> users(id)`, `month DATE NOT NULL`, `salary_override_cents BIGINT NULL`, `savings_cents BIGINT NOT NULL DEFAULT 0`, timestamps.
    - Unique: `(user_id, month)`
    - Index: `(user_id, month DESC)` for navigation.
  - `expenses`:
    - `id UUID PK`, `user_id UUID FK -> users(id)`, `month_id UUID FK -> budget_months(id) ON DELETE CASCADE`, `name TEXT NOT NULL`, `amount_cents BIGINT NOT NULL`, `category_id UUID FK -> categories(id)`, `origin TEXT CHECK(origin IN ('recurring','manual')) DEFAULT 'manual'`, timestamps.
    - Index: `(user_id, month_id)` and `(user_id, created_at DESC)`, `(user_id, category_id)`.
  - `recurring_expenses`:
    - `id UUID PK`, `user_id UUID FK -> users(id)`, `name TEXT NOT NULL`, `amount_cents BIGINT NOT NULL`, `category_id UUID FK -> categories(id)`, `active BOOLEAN NOT NULL DEFAULT TRUE`, `starts_on DATE NOT NULL`, `ends_on DATE NULL`, timestamps.
    - Index: `(user_id, active)`, `(user_id, starts_on)`, `(user_id, category_id)`.
  - `categories`:
    - `id UUID PK`, `user_id UUID FK -> users(id)`, `name TEXT NOT NULL`, timestamps.
    - Unique: `(user_id, name)`.
  - `savings_accounts` (optional; or one default):
    - `id UUID PK`, `user_id UUID FK -> users(id)`, `name TEXT NOT NULL`, timestamps.
  - `savings_goals`:
    - `id UUID PK`, `user_id UUID FK -> users(id)`, `name TEXT NOT NULL`, `target_cents BIGINT NOT NULL`, `due_date DATE NULL`, `account_id UUID FK -> savings_accounts(id) NULL`, timestamps.
    - Index: `(user_id)`.
  - `savings_entries`:
    - `id UUID PK`, `user_id UUID FK -> users(id)`, `account_id UUID FK -> savings_accounts(id) NULL`, `goal_id UUID FK -> savings_goals(id) NULL`, `amount_cents BIGINT NOT NULL`, `happened_on DATE NOT NULL`, `note TEXT NULL`, timestamps.
    - Index: `(user_id, happened_on DESC)`.

- Additional indexes:
  - Partial index on `recurring_expenses (user_id)` where `active = TRUE`.
  - Functional index for month navigation: `budget_months (user_id, month DESC)`.

- Prisma model sketch (excerpt):
```prisma
model User {
  id              String   @id @default(uuid())
  username        String   @unique
  email           String   @unique
  emailVerified   DateTime?
  hashedPassword  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  profile         Profile?
}

model Profile {
  userId              String  @id
  user                User    @relation(fields: [userId], references: [id])
  displayName         String?
  themePref           String  @default("system")
  defaultSalaryCents  BigInt  @default(0)
  firstTrackedMonth   DateTime
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model BudgetMonth {
  id                  String  @id @default(uuid())
  userId              String
  month               DateTime
  salaryOverrideCents BigInt?
  savingsCents        BigInt   @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  @@unique([userId, month])
  @@index([userId, month(sort: Desc)])
}

model Expense {
  id           String  @id @default(uuid())
  userId       String
  monthId      String
  name         String
  amountCents  BigInt
  categoryId   String
  origin       String   @default("manual")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  budgetMonth  BudgetMonth @relation(fields: [monthId], references: [id], onDelete: Cascade)
  category     Category   @relation(fields: [categoryId], references: [id])
  @@index([userId, monthId])
  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, categoryId])
}

model RecurringExpense {
  id           String  @id @default(uuid())
  userId       String
  name         String
  amountCents  BigInt
  categoryId   String
  active       Boolean @default(true)
  startsOn     DateTime
  endsOn       DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  category     Category   @relation(fields: [categoryId], references: [id])
  @@index([userId, active])
  @@index([userId, startsOn])
  @@index([userId, categoryId])
}

model Category {
  id        String   @id @default(uuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@unique([userId, name])
}
```

---

## 3) UX map and routes

- Layout: `src/app/layout.tsx` with top nav: Logo, `Start`, `Savings`, `Year view` (optional later), `Settings`, `Log out`.
- Routes:
  - `/auth/login` → sign in form.
  - `/auth/register` → registration form (username, email, password, confirm password).
  - `/auth/forgot` and `/auth/reset` → optional password reset flow.
  - `/` (Start) → Month dashboard (donut chart, salary box, savings amount, expenses list, arrows prev/next).
  - `/savings` → list accounts, goals; add entries; progress bars.
  - `/settings` → theme toggle, default salary, first tracked month, recurring expenses CRUD, change password, delete account.
  - `/api/*` route handlers for server mutations if not using Server Actions.
- Components (high level):
  - `MonthNavigator`, `DonutChart`, `ExpenseList`, `ExpenseForm`, `SalaryAndSavingsCard`, `ThemeToggle`, `RecurringExpenseList`, `GoalCard`, `SavingsEntryForm`.

---

## 4) Visual spec notes

- Donut shows expense slices; inner label shows remaining = salary_this_month - total_expenses - savings_this_month.
- Legend syncs with expense list colors.
- Live update on add/remove expense or edit salary/savings.
- Responsive: Use MUI Grid/Container: 3-column desktop (left: salary/savings, center: donut, right: expenses), single-column stack on mobile.

---

## 5) Delivery steps (checklist)

### A. Project bootstrap
- [x] A1. Install deps:
  - `@mui/material @mui/icons-material @emotion/react @emotion/styled`, `@tanstack/react-query`, `recharts`, `zod`, `date-fns`, `next-auth`, `@prisma/client`.
  - Dev: `prisma`, `eslint`, `prettier`, `vitest`, `@testing-library/react`, `playwright` (or Cypress).
- [x] A2. Set up MUI theme: create `src/theme/index.ts` with `createTheme()` for light/dark; export `getTheme(mode)`.
- [x] A3. Add providers in `layout.tsx`: React Query, MUI `ThemeProvider`, and `CssBaseline`.
- [x] A4. Configure environment vars: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, email provider creds (if used).

### B. Database & auth setup (PostgreSQL + Prisma + NextAuth)
- [x] B1. Provision PostgreSQL on your server; enable `citext` extension.
- [x] B2. Add Prisma: `prisma` dir with `schema.prisma` using `postgresql` provider; define models above.
- [x] B3. Run `prisma migrate dev` for local; `prisma migrate deploy` in CI/CD.
  - Note: Prisma reads `DATABASE_URL` from `.env` by default. Either place it in `.env`, or use `dotenv -e .env.local -- prisma ...` in scripts.
- [x] B4. Seed dev data: a user, profile, sample months and expenses with Prisma seed. (Skipped - will add manually)
- [x] B5. Integrate NextAuth (Credentials or Email provider). Store users in `users` table.

### C. Auth flows
 - [x] C1. NextAuth route handlers and config; session strategy `jwt`.
 - [x] C2. Middleware to protect app routes; redirect unauthenticated to `/auth/login`.
 - [x] C3. `/auth/login` page: username or email + password; show link to register and forgot password.
 - [x] C4. `/auth/register` page: fields = username (login), email, password, confirm password.
   - Validate: username [3–32], email, password strength, `password === confirm`.
   - On submit: ensure `username` and `email` are unique, hash password (Argon2/bcrypt), create `users` + `profiles` rows.
   - Optional: send verification email; block sign-in until verified.
 - [ ] C5. Forgot/reset password flow (optional): email token, reset form.
 - [x] C6. Add `Log out` in navbar; implement delete account and change password via custom endpoints.
   - Log out button implemented in navbar
   - Change password and delete account UI added to settings (backend implementation pending)

### D. Core domain logic
- [ ] D1. Month key utilities: normalize to first day-of-month, prev/next calculators, formatters.
- [ ] D2. Salary resolution order for a given month:
  - `salary_this_month = budget_months.salary_override_cents ?? profiles.default_salary_cents`.
- [ ] D3. Applying recurring expenses:
  - On first visit to a month (or on demand action), create missing `expenses` from active `recurring_expenses` matching month range.
  - Store an `origin = 'recurring' | 'manual'` column (optional) for clarity.
- [ ] D4. Savings effect:
  - Track `budget_months.savings_cents` as the amount “put aside” this month.
  - Savings page writes corresponding `savings_entries` (optional: write both, or compute `budget_months.savings_cents` from entries for the month).
- [ ] D5. Computations:
  - `total_expenses_cents = sum(expenses.amount_cents for month)`.
  - `remaining_cents = salary_this_month - total_expenses_cents - budget_months.savings_cents`.

### E. API/Server Actions
- [ ] E1. Queries:
  - `getOrCreateMonth(month)`: ensures `budget_months` row exists.
  - `getMonthData(month)`: salary resolved, savings, expenses list.
  - `listMonths(range)`: for year view later.
- [ ] E2. Mutations:
  - `setDefaultSalary(cents)`, `setFirstTrackedMonth(date)`, `setTheme(pref)`.
  - `setMonthSalaryOverride(month, cents|null)`, `setMonthSavings(month, cents)`.
  - `addExpense(month, {name, amount, categoryId})`, `updateExpense(id, ...)`, `deleteExpense(id)`.
  - `addRecurringExpense({name, amount, categoryId, startsOn, endsOn})`, `updateRecurringExpense(...)`, `toggleRecurringExpenseActive(id, active)`, `deleteRecurringExpense(id)`.
  - `createCategory(name)`, `renameCategory(id, name)`, `deleteCategory(id)` (cascade prevention if referenced).
  - `applyRecurringForMonth(month)`.
  - Savings: `addSavingsEntry(...)`, `deleteSavingsEntry(...)`, `upsertGoal(...)`, `deleteGoal(id)`.
- [ ] E3. Implement as Server Actions where possible; fall back to `/api/*` route handlers for client calls using Prisma client.

### F. Start (Month) page
- [ ] F1. URL state: `/` shows current month by default; include `?m=YYYY-MM` param for deep link.
- [ ] F2. `MonthNavigator` with left/right arrows; respects `profiles.first_tracked_month`.
- [ ] F3. `SalaryAndSavingsCard`:
  - Displays resolved salary and savings for the month.
  - Inline edit: override salary for this month, set savings for this month.
- [ ] F4. `ExpenseList`:
  - Table/list with label, category, amount, delete/edit actions.
  - `ExpenseForm` to add new expense.
- [ ] F5. `DonutChart`:
  - Slices from expenses; a remainder slice = `max(remaining_cents, 0)`.
  - Legend synced with list; colors deterministic by category/label hash.
  - Accessible labels, tooltips.
- [ ] F6. Data fetching via React Query; optimistic updates for add/remove/edit; invalidate month query post-settlement.
- [ ] F7. On first mount for a month, show banner “Apply recurring expenses?”; confirm applies and refreshes list/chart.

### G. Savings page
- [ ] G1. List goals with progress bars: `progress = sum(entries for goal) / target`.
- [ ] G2. Add savings entry (with optional goal/account).
- [ ] G3. Simple analytics: totals per month, per goal.
- [ ] G4. Optional: drag-to-allocate from remainder to a goal.

### H. Settings page
- [x] H1. Theme toggle (light/dark/system); persist to `profiles.theme_pref`.
  - Implement with MUI `ThemeProvider` and `CssBaseline`; toggle updates `PaletteMode` and stores to profile.
- [x] H2. Default salary input; persist to profile.
- [x] H3. First tracked month picker (month-year); used by navigator to clamp prev arrow.
- [x] H4. Recurring expenses CRUD table and form.
- [ ] H5. Account actions: change password, delete account (Supabase).
- [ ] H6. Export data (CSV/JSON) – optional.

### I. Year view (later milestone)
- [ ] I1. Grid of 12 months with sparkline or mini donuts.
- [ ] I2. Quick jump to a month on click.

### J. Styling and polish
- [ ] J1. Implement desktop layout per wireframe; responsive mobile layout.
- [ ] J2. Skeletons/loading states; empty-state illustrations.
- [ ] J3. Error toasts; retry patterns.

### K. Testing
- [ ] K1. Unit-test utilities (money, month math).
- [ ] K2. Integration-test Server Actions with Prisma and a test PostgreSQL schema (or SQLite proxy for fast runs where compatible).
- [ ] K3. e2e: sign up → set defaults → add recurring → open month → apply → add expense → check donut updates → add savings.

### L. Performance and accessibility
- [ ] L1. Memoize chart/derived data.
- [ ] L2. Use `next/image` where relevant; code-split pages.
- [ ] L3. a11y checks: labels, focus traps, contrast.

### M. Deployment
- [ ] M1. Deploy Next.js app; set env vars; connect to your PostgreSQL instance over SSL.
- [ ] M2. Domain + HTTPS; run smoke tests.
- [ ] M3. Set up PostgreSQL backups (e.g., `pg_dump` cron + offsite storage) and retention policy.

---

## 6) File structure (initial)

src/
app/
layout.tsx
page.tsx // Month page
savings/page.tsx
settings/page.tsx
auth/
 login/page.tsx
 register/page.tsx
 forgot/page.tsx
 reset/page.tsx
api/...(if needed)/route.ts
plan.md // THIS PLAN
components/
month/
MonthNavigator.tsx
SalaryAndSavingsCard.tsx
ExpenseList.tsx
ExpenseForm.tsx
DonutChart.tsx
savings/
GoalCard.tsx
SavingsEntryForm.tsx
settings/
RecurringExpenseList.tsx
ThemeToggle.tsx
lib/
auth/
nextauth.ts
prisma/
schema.prisma
money.ts
month.ts
colors.ts
theme/
 index.ts

---

## 7) Data contracts (Zod)

- Money in cents (integers). Sample schemas:
```ts
export const ExpenseInput = z.object({
  label: z.string().min(1),
  category: z.string().optional(),
  amount_cents: z.number().int().positive(),
});
export const MonthParam = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
});
```

---

## 8) Donut chart spec (Recharts)

- Data: `{ name: string, value: number, color: string }[]`.
- Remainder slice keyed as `"_remaining"`; hidden when negative; clamp to 0.
- Tooltip shows amount formatted as currency and percent.
- Keyboard-focusable legend; slice colors consistent by stable hash of label/category.

---

## 9) Month navigation rules

- `currentMonth = clamp(todayMonth, firstTrackedMonth, todayMonth)` for default.
- Prev arrow disabled if `displayedMonth <= firstTrackedMonth`.
- Next arrow allowed up to `todayMonth` (or allow future months as a setting toggle).

---

## 10) Security considerations

- All server mutations check `auth.getUser()` and `user_id` ownership.
- Never trust client-sent `user_id`.
- Use parameterized queries; sanitize labels and categories.
- RLS policies are the last line of defense.

---

## 11) Milestone plan (suggested)

1. Auth + profile base + theme (A, B, C, part of H).
2. Month page read-only with fake data; donut works (F without mutations).
3. Expenses CRUD + live updates (E + F).
4. Recurring expenses + apply flow (D3 + F7 + H4).
5. Savings tab with goals (G).
6. Settings: default salary, first month, password, delete account (H).
7. Tests, perf, a11y, deploy (K, L, M).

---

## 12) Acceptance checklist (business)

- [x] Can register (username, email, password + confirmation), sign in, sign out.
- [x] Can set default salary and first tracked month.
- [ ] Can add recurring expenses and apply to a month.
- [ ] Can override salary and set savings for a month.
- [ ] Can add/edit/delete an expense and see donut update instantly.
- [ ] Can navigate months with arrows; prev respects first tracked month.
- [ ] Can create savings goals, add entries, see progress.
- [ ] Can change password and delete account.
- [ ] Theme persists across sessions.
- [ ] All data is isolated per user and persists.
