import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AppShell from './app/AppShell';
import Desktop from './app/Desktop';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading…</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <AppShell>
      <Desktop />
    </AppShell>
  );
}
