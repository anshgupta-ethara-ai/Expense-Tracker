# Minimalist Expense Tracker

This repository contains a Next.js and Supabase-based personal expense management application focused on individual and admin budgeting workflows. The project is designed to reduce manual tracking errors and improve financial visibility by digitizing expense logging, category budgets, receipts, dynamic charts, and reporting.

## Project Overview

The application leverages Next.js 14 App Router for both the frontend UI components and the backend server-side API routes, with Supabase (PostgreSQL) managing authentication, storage, and row-level isolated data structures.

Core features implemented in the repository include:

- staff authentication and protected routes (member and admin roles)
- expense operations (add, edit, delete, view, pagination, payment modes, and receipt uploads)
- category management (create, update, delete, and color assignment)
- budget management (monthly budgets per category, remaining tracker, and budget exceeded warnings)
- dynamic reports (monthly summaries, category breakdowns via Recharts, and CSV exporting)
- file upload support for transaction receipts (images and PDFs)

## Repository Structure

```text
.
|-- Golden-Response/
|   |-- .next/
|   |-- app/
|   |   |-- (auth)/
|   |   |   |-- login/page.jsx
|   |   |   `-- signup/page.jsx
|   |   |-- api/
|   |   |   |-- budgets/
|   |   |   |   |-- route.js
|   |   |   |   `-- [id]/route.js
|   |   |   |-- categories/
|   |   |   |   |-- route.js
|   |   |   |   `-- [id]/route.js
|   |   |   |-- expenses/
|   |   |   |   |-- route.js
|   |   |   |   `-- [id]/route.js
|   |   |   |-- profiles/
|   |   |   |   |-- route.js
|   |   |   |   `-- me/route.js
|   |   |-- budgets/
|   |   |   `-- page.jsx
|   |   |-- categories/
|   |   |   `-- page.jsx
|   |   |-- dashboard/
|   |   |   `-- page.jsx
|   |   |-- expenses/
|   |   |   `-- page.jsx
|   |   |-- globals.css
|   |   |-- layout.jsx
|   |   |-- not-found.jsx
|   |   |-- page.jsx
|   |   `-- reports/
|   |       `-- page.jsx
|   |-- components/
|   |   |-- BudgetCard.jsx
|   |   |-- CategoryForm.jsx
|   |   |-- ExpenseForm.jsx
|   |   |-- ExpenseList.jsx
|   |   |-- Navbar.jsx
|   |   `-- SpendingChart.jsx
|   |-- lib/
|   |   |-- helpers.js
|   |   |-- supabase.js
|   |   |-- supabase-browser.js
|   |   `-- supabase-server.js
|   |-- .env.local
|   |-- database.sql            # PostgreSQL schema and RLS policies
|   |-- jsconfig.json
|   |-- middleware.js           # Supabase auth session middleware
|   |-- package.json
|   |-- package-lock.json
|   |-- postcss.config.js
|   `-- tailwind.config.js
|-- justification.md            # Evaluation comparison write-up
|-- prompt.md                   # Original project/problem statement
`-- README.md
```

## Running the Code

### Option 1: Run locally

Prerequisites:

- Node.js 18+
- npm
- Supabase account and database instance

Database setup:

Import the SQL schemas and RLS configurations into your Supabase project's SQL editor using the SQL script provided at:

[database.sql](file:///C:/Users/Admin/expense-tracker/Golden-Response/database.sql)

Application setup:

```bash
cd Golden-Response
npm install
```

Create a localized environment file named `Golden-Response/.env.local` containing the active project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-assigned-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Start the application in development mode:

```bash
npm run dev
```

Default local URLs:

- Home/Authentication: `http://localhost:3000/`
- Dashboard View: `http://localhost:3000/dashboard`
- API base router: `http://localhost:3000/api`

## Running Checks and Tests

Code linting and checking:

```bash
cd Golden-Response
npm run lint
```

Production build validation:

```bash
npm run build
```

Testing status:

- Next.js has lint and production compile checks available.
- There is currently no repository-wide automated unit testing framework.

## Brief Explanation of the Evaluation

The file [justification.md](file:///C:/Users/Admin/expense-tracker/justification.md) contains a comparative analysis highlighting model strengths and architectural alignment decisions.

In that evaluation:

- both responses are scored across correctness, relevance, completeness, style, helpfulness, creativity, and coherence.
- GPT is judged as the better overall response because it scores better on completeness, helpfulness, structure, and coherence.
- Gemini is noted as slightly stronger in correctness and creativity.
- the final verdict says GPT is "slightly better".

For the original implementation requirements and scope of the project, see [prompt.md](file:///C:/Users/Admin/expense-tracker/prompt.md).
