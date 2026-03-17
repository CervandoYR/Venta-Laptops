import { Outlet, NavLink } from "react-router-dom";

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/80">
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <span className="font-semibold text-lg">Academy Admin</span>
        </div>
        <nav className="p-4 space-y-2">
          <NavLink
            to="/app"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-slate-800 text-white" : "text-slate-300"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/students"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-slate-800 text-white" : "text-slate-300"
              }`
            }
          >
            Alumnos
          </NavLink>
          <NavLink
            to="/app/leads"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-slate-800 text-white" : "text-slate-300"
              }`
            }
          >
            Leads
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1">
        <header className="h-16 border-b border-slate-800 flex items-center px-6">
          <h1 className="font-semibold text-lg">Panel de administración</h1>
        </header>
        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

