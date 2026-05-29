## Prompt

You are developing a Expense Tracker System to help user track their daily expenses, manage their budgets, and get better idea of their spending habits.

--- 

## Objective

Build an expense tracker where users can log daily expenses, set monthly budgets per category, and view spending reports. The goal is a clean, fast tool — not feature-heavy, just reliable for everyday personal finance use.
The project is built using Next.js and Supabase to provide fast and minimal solution for managing personal expense workflows.

## Context and Role

As a Next.js and Supabase developer working on expense tracking system, you are responsible for designing and implementing end to end expense tracker, with 2 layered architecture like Frontend, Backend (via Supabase). The system must have all the core operations of expense tracking workflow which help reducing manual errors and give better financial visibility.

## Recommended Tech Stack

### Frontend
- Next.js 14 with App Router for UI
- Tailwind CSS for styling
- Recharts for spending charts and graphs
- Native fetch API for all data calls

### Backend
- Next.js API Routes for server side logic
- Supabase Auth for authentication and authorization
- Supabase Row Level Security (RLS) for data protection

### Database
- Supabase (PostgreSQL) - used for saving the data

### File Upload
- Supabase Storage - used for saving expense receipts (image/pdf)

---

## Requirements
1. Authentication & Authorization

- Roles
```
- admin
- member
```

- Features

```
- Signup
- Login
- Logout
- Supabase session management
- Protected routes
```

2. Expense Management

- Expense Operations
```
- Add expense
- Edit expense
- Delete expense
- View all expenses
- Filter by date, category, payment mode
- Upload receipt (image/pdf)
```

- Category Management

```
- Create category
- Update category
- Delete category
- Assign color to category
```

- Budget Management

```
- Set monthly budget per category
- Track remaining budget
- Budget exceeded alerts
```

- Reports

```
- Monthly spending summary
- Category wise breakdown
- Export as CSV
```

## Frontend Pages

1. Login
2. Signup
3. Dashboard
4. Expense list page
5. Add/Edit expense form
6. Budget management page
7. Reports page
8. Error/404 page

## Folder Structure

```
expense-tracker/
│
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── signup/page.jsx
│   ├── dashboard/page.jsx
│   ├── expenses/page.jsx
│   ├── budgets/page.jsx
│   ├── reports/page.jsx
│   ├── not-found.jsx
│   ├── layout.jsx
│   └── page.jsx
│
├── app/api/
│   ├── expenses/
│   │   ├── route.js
│   │   └── [id]/route.js
│   ├── categories/
│   │   ├── route.js
│   │   └── [id]/route.js
│   └── budgets/
│       ├── route.js
│       └── [id]/route.js
│
├── components/
│   ├── ExpenseForm.jsx
│   ├── ExpenseList.jsx
│   ├── BudgetCard.jsx
│   ├── SpendingChart.jsx
│   └── Navbar.jsx
│
├── lib/
│   ├── supabase.js
│   └── helpers.js
│
├── middleware.js
├── .env.local
└── README.md
```

## File Breakdown

Write complete code for each file one by one.

### app/layout.jsx
- Root layout wrapping all pages
- Import Tailwind global styles
- Add Navbar component
- Wrap children with Supabase session provider

### app/page.jsx
- Root page, redirect to /dashboard if logged in else redirect to /login

### app/not-found.jsx
- Simple 404 page with message and link back to dashboard

### app/(auth)/login/page.jsx
- Login form with email and password fields
- On submit call Supabase signInWithPassword
- Redirect to /dashboard on success
- Show error toast on failure

### app/(auth)/signup/page.jsx
- Signup form with full name, email and password fields
- On submit call Supabase signUp
- Redirect to /dashboard on success
- Show error toast on failure

### app/dashboard/page.jsx
- Show total expenses this month
- Show total budget left
- Render SpendingChart component
- Fetch data from /api/expenses and /api/budgets

### app/expenses/page.jsx
- Show ExpenseList component
- Have a button to open ExpenseForm for adding new expense
- Support filter by date, category and payment mode

### app/budgets/page.jsx
- Show list of BudgetCard for each category
- Allow setting or updating monthly budget per category

### app/reports/page.jsx
- Show monthly spending summary
- Show category wise breakdown using Recharts
- Button to export data as CSV

### app/api/expenses/route.js
- GET — returns all expenses of logged in user
- POST — adds new expense, validate body before insert

### app/api/expenses/[id]/route.js
- GET — fetch one expense by id
- PUT — edit a specific expense
- DELETE — remove expense from database

### app/api/categories/route.js
- GET — get all categories of current user
- POST — create new category with name and color

### app/api/categories/[id]/route.js
- PUT — edit category name or color
- DELETE — remove a category

### app/api/budgets/route.js
- GET — get all budgets of current user
- POST — set budget for a category and month

### app/api/budgets/[id]/route.js
- PUT — update the budget limit

### components/Navbar.jsx
- Show app name and nav links to dashboard, expenses, budgets, reports
- Show logout button
- On logout call Supabase signOut and redirect to /login

### components/ExpenseForm.jsx
- Form with title, amount, category dropdown, date, payment mode, notes and receipt upload
- On submit POST to /api/expenses or PUT to /api/expenses/:id if editing
- Show validation errors inline

### components/ExpenseList.jsx
- Render list of all expenses
- Each row shows title, amount, category, date, payment mode
- Edit and delete button on each row
- Delete calls DELETE /api/expenses/:id

### components/BudgetCard.jsx
- Show category name, budget limit and amount spent
- Show progress bar for how much budget is used
- Show warning if budget is exceeded

### components/SpendingChart.jsx
- Use Recharts BarChart or PieChart
- Show spending grouped by category for current month
- Load with Next.js dynamic import

### lib/supabase.js
- Create and export Supabase client using createClientComponentClient
- Create and export Supabase server client using createServerComponentClient

### lib/helpers.js
- formatCurrency(amount) — format number to currency string
- formatDate(date) — format date to readable string
- exportToCSV(data) — convert array of objects to CSV and trigger download

### middleware.js
- Protect all routes except /login and /signup
- If user is not logged in redirect to /login
- Use Supabase middleware helper to refresh session

## Inputs/Output Validations

1 Signup
Fields
- Email
- Password
- Full name
Rules
- Password length should be more then 6.
- Valid email format validation.
- Full name must not be empty.

2 Login
- Validate the credentials email and password.
- Store session via Supabase client for session management.
- Return meaningful error response and proper HTTP status codes if authentication fails.

3 Add Expense fields
- Title
- Amount
- Category
- Date
- Payment mode (cash, card, UPI)
- Notes (optional)
- Receipt upload (optional)

## Database design

Categories Table
- id
- user_id
- name
- color
- created_at

Expenses Table
- id
- user_id
- category_id
- title
- amount
- date
- payment_mode
- notes
- receipt_url
- created_at

Budgets Table
- id
- user_id
- category_id
- month
- amount_limit
- created_at

## Security

- RLS in Supabase so users cant see each other's data
- Next.js middleware to block pages if user is not logged in
- validate request body before touching the database
- NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are safe to expose to the browser — Supabase RLS handles access control for these
- SUPABASE_SERVICE_ROLE_KEY must never leave the server, use it only in API routes, never in client components

## Performance & Scalability

- put indexes on user_id, category_id and date in Supabase for faster queries
- use Next.js dynamic() for Recharts components, no need to load charts on every page
- RLS already filters data by user so dont add extra where clauses in API for same thing
- dont install extra packages if Next.js or Supabase already handle it

## Performance Requirements

- Expense list page must support pagination (20 items per page)
- API responses should return within 500ms under normal load
- Receipt uploads limited to 5MB per file (image/pdf)
- Dashboard data should be cached for 60 seconds to avoid repeated DB hits

## Error handling

- Use try-catch blocks in all API route handlers
- Return meaningful HTTP status codes
- Handle Supabase specific errors like auth failures, RLS violations and storage errors properly
- Show toast notifications on frontend for all errors and success actions
{
"success": false,
"message": "Expense not found or access denied"
}

## Documentation

- Add a proper Readme.md which help to know about the project, setup steps and environment variables needed.

## Final Deliverables

Develop the complete system with:
- Proper folder structure
- Clean and reusable code
- Responsive frontend
- RESTful backend APIs
- Secure authentication
- Error handling
- Validation
- Documentation
