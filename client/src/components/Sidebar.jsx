import { CalendarDays, CheckSquare2, LayoutDashboard, Settings, Sparkles, Users } from "lucide-react";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare2 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "team", label: "Team", icon: Users },
];

function Sidebar({ activePage = "tasks", onNavigate }) {
  const navigate = (page) => onNavigate?.(page);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
      <button type="button" onClick={() => navigate("overview")} className="flex items-center gap-3 rounded-xl px-2 text-left">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white"><Sparkles size={19} /></div>
        <div><p className="font-semibold text-slate-950">FlowPilot</p><p className="text-xs text-slate-500">AI workspace</p></div>
      </button>

      <nav className="mt-8 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <button key={id} type="button" onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
              <Icon size={18} />{label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button type="button" onClick={() => navigate("settings")} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${activePage === "settings" ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
          <Settings size={18} />Settings
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
