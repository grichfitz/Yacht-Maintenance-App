import { supabase } from '../lib/supabase';

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Yacht Maintenance App</h1>
      </header>

      <main className="app-content">
        {children}
      </main>

      <footer className="app-footer">
        <span>© Worthy Marine</span>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </footer>
    </div>
  );
}
