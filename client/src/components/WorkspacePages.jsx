import { CalendarDays, CheckCircle2, Clock3, ListTodo, Settings2, Users } from "lucide-react";

const statusLabel = {
  "TO DO": "To do",
  "IN PROGRESS": "In progress",
  PAUSED: "Paused",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
};

const PageShell = ({ eyebrow, title, description, children }) => (
  <div className="mx-auto max-w-[1400px]">
    <div className="mb-6">
      <p className="text-sm font-semibold text-violet-600">{eyebrow}</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    {children}
  </div>
);

export function OverviewPage({ tasks = [], onNavigate }) {
  const approved = tasks.filter((task) => task.status === "APPROVED").length;
  const active = tasks.filter((task) => task.status === "IN PROGRESS").length;
  const upcoming = tasks.filter((task) => task.deadline && new Date(task.deadline) >= new Date()).length;

  const stats = [
    { label: "Total tasks", value: tasks.length, icon: ListTodo },
    { label: "In progress", value: active, icon: Clock3 },
    { label: "Approved", value: approved, icon: CheckCircle2 },
    { label: "Upcoming deadlines", value: upcoming, icon: CalendarDays },
  ];

  return (
    <PageShell eyebrow="Workspace" title="Overview" description="A quick snapshot of your current project workload.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon size={17} /></div>
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-950">Recent tasks</h2>
            <p className="text-sm text-slate-500">Your latest project activity.</p>
          </div>
          <button type="button" onClick={() => onNavigate("tasks")} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Open board</button>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {tasks.slice(0, 5).map((task) => (
            <div key={task._id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{task.title}</p><p className="text-xs text-slate-500">{task.assignee}</p></div>
              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{statusLabel[task.status] || task.status}</span>
            </div>
          ))}
          {!tasks.length && <p className="py-6 text-center text-sm text-slate-500">No tasks yet.</p>}
        </div>
      </div>
    </PageShell>
  );
}

export function CalendarPage({ tasks = [] }) {
  const datedTasks = tasks
    .filter((task) => task.deadline)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  return (
    <PageShell eyebrow="Planning" title="Calendar" description="Upcoming task deadlines in chronological order.">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-3">
          {datedTasks.map((task) => (
            <div key={task._id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><CalendarDays size={20} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{task.title}</p><p className="mt-0.5 text-xs text-slate-500">{task.assignee} · {statusLabel[task.status] || task.status}</p></div>
              <div className="shrink-0 text-right"><p className="text-sm font-semibold text-slate-700">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(task.deadline))}</p><p className="text-[11px] text-slate-400">Deadline</p></div>
            </div>
          ))}
          {!datedTasks.length && <div className="py-12 text-center"><CalendarDays className="mx-auto text-slate-300" size={34} /><p className="mt-3 text-sm font-medium text-slate-600">No deadlines yet</p><p className="mt-1 text-xs text-slate-400">Add a deadline when creating or editing a task.</p></div>}
        </div>
      </div>
    </PageShell>
  );
}

export function TeamPage({ tasks = [] }) {
  const members = Object.values(tasks.reduce((acc, task) => {
    const name = task.assignee || "Unassigned";
    if (!acc[name]) acc[name] = { name, total: 0, active: 0 };
    acc[name].total += 1;
    if (task.status === "IN PROGRESS") acc[name].active += 1;
    return acc;
  }, {}));

  return (
    <PageShell eyebrow="People" title="Team" description="See how work is distributed across assignees.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => {
          const initials = member.name === "Unassigned" ? "?" : member.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
          return <div key={member.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">{initials}</div><div><p className="font-semibold text-slate-900">{member.name}</p><p className="text-xs text-slate-500">{member.total} task{member.total === 1 ? "" : "s"}</p></div></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><Users size={15} />{member.active} currently in progress</div></div>;
        })}
        {!members.length && <div className="col-span-full rounded-2xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-500">No team activity yet.</div>}
      </div>
    </PageShell>
  );
}

export function SettingsPage() {
  return (
    <PageShell eyebrow="Workspace" title="Settings" description="Project preferences for the assessment workspace.">
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Settings2 size={18} /></div><div><p className="font-semibold text-slate-900">FlowPilot workspace</p><p className="text-xs text-slate-500">AI-powered Kanban task manager</p></div></div>
        <div className="mt-6 space-y-4"><div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Workspace name</label><input value="Product Development" readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" /></div><div><label className="mb-1.5 block text-sm font-semibold text-slate-700">Default task status</label><input value="TO DO" readOnly className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600" /></div></div>
      </div>
    </PageShell>
  );
}
