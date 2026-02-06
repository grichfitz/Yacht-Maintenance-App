import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

import AppShell from "../app/AppShell";
import LoginPage from "../pages/LoginPage";
import AppRoutes from "../app/routes";

export default function AppBootstrap() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

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

  // Restore last route OR send to desktop after login
  useEffect(() => {
    if (session) {
      const lastRoute = localStorage.getItem("lastRoute");

      if (lastRoute) {
        navigate(lastRoute, { replace: true });
      } else if (location.pathname === "/") {
        navigate("/desktop", { replace: true });
      }
    }
  }, [session]);

  // Persist route changes
  useEffect(() => {
    if (location.pathname !== "/login") {
      localStorage.setItem("lastRoute", location.pathname);
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <AppShell showLogout={false}>
        <div style={{ padding: 20 }}>Loading…</div>
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell showLogout={false}>
        <LoginPage />
      </AppShell>
    );
  }

  return (
    <AppShell showLogout={true}>
      <AppRoutes />
    </AppShell>
  );
}
