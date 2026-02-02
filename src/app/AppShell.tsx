type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Yacht Maintenance App</h1>
      </header>

      <main className="app-content">
        {children}
      </main>

      <footer className="app-footer">
        <span>© Marine</span>
      </footer>
    </div>
  );
}
