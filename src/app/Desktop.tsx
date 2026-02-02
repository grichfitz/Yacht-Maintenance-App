type DesktopApp = {
  id: string;
  name: string;
};

const APPS: DesktopApp[] = [
  { id: 'tasks', name: 'Tasks' },
  { id: 'yachts', name: 'Yachts' },
  { id: 'users', name: 'Users' },
  { id: 'reports', name: 'Reports' },
];

export default function Desktop() {
  return (
    <div className="desktop">
      <div className="desktop-grid">
        {APPS.map(app => (
          <button
            key={app.id}
            className="desktop-app"
            onClick={() => {
              // routing comes later
              console.log(`Open app: ${app.name}`);
            }}
          >
            <div className="desktop-app-icon" />
            <span className="desktop-app-label">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
