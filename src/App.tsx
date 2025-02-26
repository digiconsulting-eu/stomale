
import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './integrations/supabase/client';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Session } from '@supabase/supabase-js';
import { Toaster } from "sonner"
import { setPageTitle, getDefaultPageTitle } from './utils/pageTitle';
import { regenerateSitemaps } from "./utils/sitemapUtils";

import Home from './pages/Home';
import Conditions from './pages/Conditions';
import Condition from './pages/Condition';
import Reviews from './pages/Reviews';
import Review from './pages/Review';
import NewReview from './pages/NewReview';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const defaultTitle = getDefaultPageTitle("Home");
    setPageTitle(defaultTitle);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  // Aggiungi la funzione all'oggetto window per l'accesso dalla console
  if (typeof window !== 'undefined') {
    (window as any).regenerateSitemaps = regenerateSitemaps;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/patologia/:condition" element={<Condition />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/patologia/:condition/esperienza/:id" element={<Review />} />
          <Route path="/nuova-esperienza" element={
            session ? <NewReview session={session} /> : <Navigate to="/profile" replace={true} />
          } />
          <Route path="/profile" element={
            <div className="container" style={{ padding: '50px 0 100px 0' }}>
              {!session ? (
                <Auth 
                  supabaseClient={supabase} 
                  appearance={{ theme: ThemeSupa }} 
                  localization={{ variables: { sign_in: { email_label: 'Email', password_label: 'Password' } } }}
                />
              ) : (
                <Profile session={session} />
              )}
            </div>
          } />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors />
    </>
  );
}

export default App;
