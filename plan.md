# Vibe Finances – Step-by-step Delivery Plan

A Next.js (App Router) app to track monthly salary, expenses, and savings with authentication, theming, and a donut chart per month.

---

## 📊 Current Implementation Status (Updated: 2025-10-08)

### ✅ **Completed Features:**

#### **Authentication & User Management**
- ✅ User registration (username, email, password with confirmation)
- ✅ Login/logout functionality
- ✅ Protected routes with middleware
- ✅ Session management with NextAuth (JWT strategy)
- ✅ Profile creation on registration

#### **Core Dashboard** (`/dashboard`)
- ✅ Three-column layout (salary/savings | donut chart | expenses)
- ✅ Month navigation (prev/next with first tracked month restriction)
- ✅ Auto-creates budget months on navigation
- ✅ Salary override per month (auto-save on blur)
- ✅ Savings tracking per month (auto-save on blur)
- ✅ Live-updating donut chart with expense breakdown
- ✅ Expense CRUD (add, edit, delete)
- ✅ Category assignment for all expenses
- ✅ Sync button to restore missing recurring expenses
- ✅ Real-time calculations (remaining = salary - expenses - savings)

#### **Settings Page** (`/settings`)
- ✅ Theme toggle (light/dark/system) with persistence
- ✅ Default monthly salary configuration
- ✅ First tracked month picker
- ✅ Category management (CRUD with duplicate prevention)
- ✅ Recurring expense management (CRUD with category assignment)
- ✅ Change password & delete account UI (backend pending)

#### **Data & API**
- ✅ PostgreSQL database with Prisma ORM
- ✅ Complete REST API for all resources
- ✅ TanStack Query for client-side data management
- ✅ Optimistic updates and cache invalidation
- ✅ BigInt handling for monetary values (cents)
- ✅ Month stored as "YYYY-MM" string format
- ✅ SQL injection protection via parameterized queries
- ✅ Input validation with Zod (frontend & backend)

#### **Recurring Expenses System**
- ✅ Auto-populates individual expense records on budget month creation
- ✅ Date range filtering (startsOn, endsOn)
- ✅ Manual sync to restore deleted recurring expenses
- ✅ All expenses treated as individual records (editable independently)

#### **Styling & UX**
- ✅ Material-UI (MUI) with Emotion
- ✅ SCSS for global styles
- ✅ Theme-aware components (light/dark mode)
- ✅ Loading states (CircularProgress)
- ✅ Responsive dialogs and forms

### 🚧 **Pending Features:**
- ⏳ Savings goals and entries management
- ⏳ Year view with month grid
- ⏳ Change password backend implementation
- ⏳ Delete account backend implementation
- ⏳ Forgot/reset password flow
- ⏳ Error pages (404, 500, auth errors)
- ⏳ Unit and E2E tests
- ⏳ Mobile responsive layouts
- ⏳ Empty state illustrations
- ⏳ Export data (CSV/JSON)

### 📦 **Tech Stack:**
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **UI**: Material-UI, Emotion, SCSS
- **Charts**: Recharts (donut chart)
- **State**: TanStack Query (React Query)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials provider)
- **Validation**: Zod
- **Date**: date-fns

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
 - [x] C7. Root route (`/`) redirects to `/dashboard` for authenticated users.

### D. Core domain logic
- [x] D1. Month key utilities: normalize to first day-of-month, prev/next calculators, formatters.
  - Implemented in dashboard: month stored as "YYYY-MM" string format
  - Navigation functions handle prev/next month calculations
- [x] D2. Salary resolution order for a given month:
  - `salary_this_month = budget_months.salary_override_cents ?? profiles.default_salary_cents`.
  - Implemented in dashboard with auto-population of default salary
- [x] D3. Applying recurring expenses:
  - Auto-creates individual expense records from active `recurring_expenses` when budget month is first created
  - All expenses are now individual records (no distinction between recurring/manual at display time)
  - Manual sync button available to add missing recurring expenses
- [x] D4. Savings effect:
  - Track `budget_months.savings_cents` as the amount "put aside" this month.
  - Persists on blur in dashboard
  - Savings entries feature (separate from budget month savings) still pending
- [x] D5. Computations:
  - `total_expenses_cents = sum(expenses.amount_cents for month)`.
  - `remaining_cents = salary_this_month - total_expenses_cents - budget_months.savings_cents`.
  - All calculations working in dashboard with live donut chart updates

### E. API/Server Actions
- [x] E1. Queries:
  - `GET /api/budget-months?month=YYYY-MM`: fetches budget month data
  - `GET /api/expenses?monthId=UUID`: fetches expenses for a month
  - `GET /api/recurring-expenses`: fetches all active recurring expenses
  - `GET /api/profile`: fetches user profile with settings
  - `GET /api/categories`: fetches all user categories
- [x] E2. Mutations:
  - ✅ `PATCH /api/profile`: `setDefaultSalary(cents)`, `setFirstTrackedMonth(date)`, `setTheme(pref)`.
  - ✅ `POST /api/budget-months`: create budget month
  - ✅ `PATCH /api/budget-months/[id]`: `setMonthSalaryOverride(month, cents|null)`, `setMonthSavings(month, cents)`.
  - ✅ `POST /api/expenses`: `addExpense({name, amountCents, categoryId, monthId})`
  - ✅ `PATCH /api/expenses/[id]`: `updateExpense(id, {name, amountCents, categoryId})`
  - ✅ `DELETE /api/expenses/[id]`: `deleteExpense(id)`
  - ✅ `POST /api/recurring-expenses`: `addRecurringExpense({name, amountCents, categoryId, startsOn, endsOn})`
  - ✅ `PATCH /api/recurring-expenses/[id]`: `updateRecurringExpense(id, {name, amountCents, categoryId, startsOn, endsOn, active})`
  - ✅ `DELETE /api/recurring-expenses/[id]`: `deleteRecurringExpense(id)`
  - ✅ `POST /api/categories`: `createCategory(name)`
  - ✅ `PATCH /api/categories/[id]`: `renameCategory(id, name)`
  - ✅ `DELETE /api/categories/[id]`: `deleteCategory(id)` (cascade prevention if referenced)
  - Auto-apply recurring expenses on budget month creation
  - Manual sync via dashboard button
  - [ ] Savings: `addSavingsEntry(...)`, `deleteSavingsEntry(...)`, `upsertGoal(...)`, `deleteGoal(id)`.
- [x] E3. Implemented as route handlers (`/api/*`) with Prisma client, TanStack Query for client-side data management.

### F. Dashboard (Month) page  
- [x] F1. URL state: `/dashboard` shows current month by default. (Deep link with query param pending)
- [x] F2. Month Navigator with left/right arrows; respects `profiles.first_tracked_month`.
  - Disables prev button when at first tracked month
  - Allows navigation to future months
  - Auto-creates budget month when navigating to new month
- [x] F3. Salary & Savings Section:
  - Displays resolved salary (override or default) and savings for the month
  - Inline edit: text fields with auto-save on blur
  - Three-column layout: 25% salary/savings, 50% chart, 25% expenses
- [x] F4. Expense List:
  - Table/list with name, amount (PLN), category chip
  - Edit and delete buttons for each expense
  - Add expense dialog with name, amount, category selection
  - All expenses are individual records (recurring template copies)
  - Sync button to restore missing recurring expenses
- [x] F5. Donut Chart:
  - Slices from expenses with different colors
  - Remainder slice shown when salary > expenses + savings
  - Legend with expense names and values
  - Recharts implementation
  - Tooltips on hover
- [x] F6. Data fetching via React Query; cache invalidation on mutations; real-time updates.
  - `useProfile`, `useRecurringExpenses`, `useBudgetMonth`, `useExpenses`, `useCategories` hooks
  - Optimistic updates via cache manipulation
  - Auto-save on blur prevents excessive API calls
- [x] F7. Recurring expenses auto-applied on budget month creation.
  - Manual sync button available to restore deleted recurring expenses

### G. Savings page
- [ ] G1. List goals with progress bars: `progress = sum(entries for goal) / target`.
- [ ] G2. Add savings entry (with optional goal/account).
- [ ] G3. Simple analytics: totals per month, per goal.
- [ ] G4. Optional: drag-to-allocate from remainder to a goal.

### H. Settings page
- [x] H1. Theme toggle (light/dark/system); persist to `profiles.theme_pref`.
  - Implemented with MUI `ThemeProvider` and `CssBaseline`; toggle updates `PaletteMode` and stores to profile.
  - Context provider in `src/app/providers.tsx` manages theme state
- [x] H2. Default salary input; persist to profile with auto-save on blur.
- [x] H3. First tracked month picker (month-year); used by navigator to clamp prev arrow.
  - DatePicker with month/year views only
  - Client-side rendered to prevent hydration mismatch
- [x] H4. Recurring expenses CRUD with full functionality:
  - List all active recurring expenses
  - Add new recurring expense (name, amount, category, start/end dates)
  - Edit existing recurring expense
  - Delete recurring expense
  - Category selection required
- [x] H5. Category Management CRUD:
  - List all user categories
  - Add new category (with duplicate name prevention)
  - Edit category name
  - Delete category (prevents deletion if in use by expenses)
  - Unique constraint per user on category names
- [x] H6. Account actions UI: change password, delete account.
  - UI dialogs implemented in settings
  - Backend endpoints pending implementation
- [ ] H7. Export data (CSV/JSON) – optional.

### I. Year view
- [x] I1. Grid of 12 months with sparkline or mini donuts.
- [x] I2. Quick jump to a month on click.
- [x] I3. Year navigation with previous/next year buttons.
- [x] I4. Limit year navigation to firstTrackedYear (user's first tracked month).
- [x] I5. Summary section with horizontal bar chart showing yearly expenses/categories.
- [x] I6. Toggle between "By Expenses" and "By Categories" chart views.
- [x] I7. Group expenses/categories below 500 PLN into "Other" category.
- [x] I8. Responsive layout: stacked on mobile, side-by-side on desktop.
- [x] I9. Month tiles with real data mini pie charts (no legends).
- [x] I10. Auto-create budget months when clicking empty month tiles.
- [x] I11. Visual styling for empty months (light red background with 0.2 opacity).
- [x] I12. Month labels on tiles with responsive font sizing.
- [x] I13. Total savings display for the selected year.
- [x] I14. MUI Charts integration for both bar chart and mini pie charts.
- [x] I15. Proper data fetching with React Query hooks.
- [x] I16. Mobile-responsive grid: 2x6 on mobile, 3x4 on small, 4x3 on desktop.

### J. Progressive Web App (PWA)
- [ ] J1. Create web app manifest (manifest.json or manifest.webmanifest).
  - App name, short name, description
  - Icons in multiple sizes (192x192, 512x512, etc.)
  - Theme color and background color
  - Display mode (standalone/fullscreen)
  - Start URL and scope
- [ ] J2. Implement service worker for offline functionality.
  - Cache static assets (JS, CSS, images)
  - Cache API responses with appropriate strategies
  - Handle offline fallbacks
  - Background sync for mutations when back online
- [ ] J3. Generate PWA icons for all device sizes.
  - App icons for Android (192x192, 512x512)
  - App icons for iOS (180x180, 167x167, 152x152, 120x120)
  - Favicon and maskable icons
- [ ] J4. Create offline fallback page.
  - Display when user is offline and page not cached
  - Show connection status
  - Queue pending actions
- [ ] J5. Add install prompt functionality.
  - Detect if app is installable
  - Show custom install prompt
  - Handle beforeinstallprompt event
  - Track installation analytics
- [ ] J6. Configure Next.js for PWA support.
  - Integrate next-pwa or similar plugin
  - Configure caching strategies
  - Set up workbox for advanced caching
- [ ] J7. Add PWA meta tags and iOS-specific tags.
  - Apple touch icon
  - Apple mobile web app capable
  - Status bar style
  - Splash screens for iOS

### K. Styling and polish
- [x] K1. Implement desktop layout per wireframe:
  - Dashboard: 3-column layout (25% left, 50% center, 25% right)
  - Settings: centered single-column layout with cards
  - Responsive considerations pending
  - SCSS instead of plain CSS
- [x] K2. Loading states with MUI CircularProgress components
  - Page-level loading for initial data fetch
  - Button-level loading for mutations
  - Empty-state handling pending
- [x] K3. Theme-aware styling: light/dark mode support throughout
  - MUI theme integration
  - Consistent button and icon styling
  - Color contrast maintained
- [ ] K4. Error pages: 404, 500, database connection errors, authentication errors (planned).

### L. Testing
- [ ] L1. Unit-test utilities (money, month math).
- [ ] L2. Integration-test Server Actions with Prisma and a test PostgreSQL schema (or SQLite proxy for fast runs where compatible).
- [ ] L3. e2e: sign up → set defaults → add recurring → open month → apply → add expense → check donut updates → add savings.

### M. Performance and accessibility
- [ ] M1. Memoize chart/derived data.
- [ ] M2. Use `next/image` where relevant; code-split pages.
- [ ] M3. a11y checks: labels, focus traps, contrast.

### N. Deployment
- [ ] N1. Deploy Next.js app; set env vars; connect to your PostgreSQL instance over SSL.
- [ ] N2. Domain + HTTPS; run smoke tests.
- [ ] N3. Set up PostgreSQL backups (e.g., `pg_dump` cron + offsite storage) and retention policy.

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
- **SQL Injection Protection**: All inputs must be validated and use Prisma's parameterized queries (which we're already doing). Never concatenate user input into raw SQL queries.
- Validate all user inputs with Zod schemas on the backend before database operations.
- Sanitize text inputs to prevent XSS attacks.
- **Input Limits**: Enforce reasonable limits on all inputs:
  - Monetary amounts (salary, expenses): max 999,999 (99,999,900 cents)
  - Text fields (names, labels): max 70 characters
  - Category names: max 50 characters
  - Notes/descriptions: max 500 characters
  - Username: 3-32 characters (already implemented)
  - Password: min 8 characters (already implemented)
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
- [x] Can create and manage categories.
- [x] Can add recurring expenses with category assignment.
- [x] Recurring expenses auto-apply when navigating to new month.
- [x] Can manually sync missing recurring expenses to current month.
- [x] Can override salary and set savings for a month (auto-save on blur).
- [x] Can add/edit/delete an expense and see donut update instantly.
- [x] Can navigate months with arrows; prev respects first tracked month; next allows future months.
- [x] Budget months auto-create when navigating to new month.
- [ ] Can create savings goals, add entries, see progress (pending).
- [x] Change password and delete account UI ready (backend pending).
- [x] Theme persists across sessions.
- [x] All data is isolated per user and persists.
- [x] SQL injection protection via Prisma parameterized queries.
- [x] Input validation and limits enforced (frontend & backend).
