
-- Rimuoviamo le policy esistenti per evitare conflitti
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Policy per permettere agli utenti di vedere il proprio profilo
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

-- Policy per permettere agli utenti di aggiornare il proprio profilo
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Policy per permettere agli amministratori di inserire nuovi utenti
CREATE POLICY "Admins can insert users" ON public.users
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy per permettere agli amministratori di vedere tutti gli utenti
CREATE POLICY "Admins can view all users" ON public.users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy per permettere agli amministratori di aggiornare tutti gli utenti
CREATE POLICY "Admins can update all users" ON public.users
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.admin 
    WHERE email = auth.jwt() ->> 'email'
  )
);

-- Policy per permettere agli amministratori di eliminare utenti
CREATE POLICY "Admins can delete users" ON public.users
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.admin 
    WHERE email = auth.jwt() ->> 'email'
  )
);
