-- 1. Create Tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'card', 'UPI')),
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  month CHAR(7) NOT NULL, -- Format: YYYY-MM
  amount_limit NUMERIC(10, 2) NOT NULL CHECK (amount_limit >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, category_id, month)
);

-- 2. Turn on RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Safely)

DO $$ 
BEGIN
    -- Profile Policies: Admins see all, users see self
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins view all, users view self profile" ON profiles;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins view all, users view self profile') THEN
        CREATE POLICY "Admins view all, users view self profile" ON profiles FOR SELECT USING (
            auth.uid() = id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        );
    END IF;

    -- Category Policies
    DROP POLICY IF EXISTS "Anyone authenticated can view categories" ON categories;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone authenticated can view categories') THEN
        CREATE POLICY "Anyone authenticated can view categories" ON categories FOR SELECT USING (auth.uid() IS NOT NULL);
    END IF;

    DROP POLICY IF EXISTS "Only admins can manage categories" ON categories;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Only admins can manage categories') THEN
        CREATE POLICY "Only admins can manage categories" ON categories FOR ALL USING (
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        );
    END IF;

    -- Expense Policies: Admins see all, users manage self
    DROP POLICY IF EXISTS "Users can manage their own expenses" ON expenses;
    DROP POLICY IF EXISTS "Admins manage all, users manage own expenses" ON expenses;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins manage all, users manage own expenses') THEN
        CREATE POLICY "Admins manage all, users manage own expenses" ON expenses FOR ALL USING (
            auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        );
    END IF;

    -- Budget Policies: Admins manage all, anyone authenticated can read
    DROP POLICY IF EXISTS "Users can manage their own budgets" ON budgets;
    DROP POLICY IF EXISTS "Viewable budgets" ON budgets;
    DROP POLICY IF EXISTS "Only admins manage budget values" ON budgets;
    DROP POLICY IF EXISTS "Admins manage all, users manage own budgets" ON budgets;
    DROP POLICY IF EXISTS "Anyone authenticated can view budgets" ON budgets;
    
    DROP POLICY IF EXISTS "Only admins can insert budgets" ON budgets;
    DROP POLICY IF EXISTS "Only admins can update budgets" ON budgets;
    DROP POLICY IF EXISTS "Only admins can delete budgets" ON budgets;
    
    -- Allow all authenticated users to read budgets
    CREATE POLICY "Anyone authenticated can view budgets" ON budgets FOR SELECT USING (
        auth.uid() IS NOT NULL
    );

    -- Restrict writes strictly to Admins
    CREATE POLICY "Only admins can insert budgets" ON budgets FOR INSERT WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
    CREATE POLICY "Only admins can update budgets" ON budgets FOR UPDATE USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
    CREATE POLICY "Only admins can delete budgets" ON budgets FOR DELETE USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
END $$;

-- 4. Create Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);

-- 5. Trigger for Automatic Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists before recreating to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
