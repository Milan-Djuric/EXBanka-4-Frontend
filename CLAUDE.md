# EXBanka-4-Frontend

## Project overview
Client-facing and employee banking portal built with React + Vite + Tailwind CSS. Two separate portals share the same codebase:
- **Employee portal** — `/` and `/admin/*` routes, protected by JWT auth
- **Client portal** — `/client/*` routes, protected by client auth context

## Stack
- React 18, React Router v6
- Tailwind CSS v3 with custom utility classes (`input-field`, `btn-primary`, `input-error`) defined in `src/index.css`
- Axios for API calls (via `src/services/apiClient.js`)
- Vite dev server

## Commands
```bash
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

## Project structure
```
src/
├── pages/
│   ├── client/       # client portal pages (/client/*)
│   ├── employee/     # employee portal pages (/, /admin/*, /login, etc.)
│   └── NotFoundPage.jsx
├── layouts/
│   ├── ClientPortalLayout.jsx   # sidebar + navbar for logged-in client pages
│   └── MainLayout.jsx           # navbar + footer for employee pages
├── context/          # React context providers (Auth, ClientAuth, Theme, Employees, Clients, Accounts)
├── components/       # shared components (Navbar, ProtectedRoute, PermissionGate, etc.)
├── models/           # plain JS classes (BankAccount, Client, Employee, Payment)
├── mocks/            # in-memory mock data (bankAccounts, clients, employees, payments)
├── services/         # API service functions (apiClient, authService, clientAuthService, etc.)
├── hooks/            # custom hooks (useWindowTitle, usePermission)
└── utils/            # utilities (permissions)
```

## Architecture notes

### Auth
- **Employee auth**: JWT stored via `tokenService`, managed in `AuthContext`. `ProtectedRoute` guards `/admin/*`.
- **Client auth**: `ClientAuthContext` wraps client portal. `clientAuthService` handles login/logout with mock backing until backend is ready.

### Mock data / API swap pattern
All pages that hit APIs use mock data while the backend is not ready. The pattern is:
1. Mock data lives in `src/mocks/` as instances of the model classes from `src/models/`
2. Services in `src/services/` export async functions — swap the body for real API calls without touching call sites
3. Model files export a `*FromApi()` mapper function to convert backend responses

### Client portal layout
All logged-in client pages use `<ClientPortalLayout>` which provides the sidebar and navbar. The sidebar uses `useLocation` for active route detection.

### Styling conventions
- Use existing Tailwind classes — avoid inline styles except for dynamic values (e.g. `gridTemplateAreas`)
- `input-field` — standard text/select/date input
- `input-error` — red border variant applied alongside `input-field`
- `btn-primary` — violet filled button

## Current status (Sprint 2)
Backend not yet integrated — all data is mocked. Pages are structured so API wiring only requires updating service functions and removing mock imports.

### Implemented client portal pages
| Route | Page | Issue |
|---|---|---|
| `/client` | ClientHomePage (landing + dashboard) | #36, #46 |
| `/client/login` | ClientLoginPage | #36 |
| `/client/accounts` | ClientAccountsOverviewPage | #19 |
| `/client/accounts/:id` | ClientAccountDetailPage | #20 |
| `/client/payments` | ClientPaymentsPage | #22 |
| `/client/payments/new` | ClientNewPaymentPage | #24 |
| `/client/payments/verify` | ClientPaymentVerifyPage | #25 |
| `/client/payments/:id` | ClientPaymentDetailPage | #33 |

### Implemented employee portal pages
Employee list, detail, create — client list, detail, create — account list, detail, create. Auth pages (login, forgot password, set/reset password).
