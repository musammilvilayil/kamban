import { Clock3, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

function TaskFormModal({ open, mode = "create", initialTask, onClose, onSubmit, loading = false }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("Unassigned");
  const [timeTracking, setTimeTracking] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(initialTask?.title || "");
    setAssignee(initialTask?.assignee || "Unassigned");
    setTimeTracking(initialTask?.timeTracking || "");
    setValidationError("");
  }, [open, initialTask]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setValidationError("Please enter a task title.");
      return;
    }

    setValidationError("");
    await onSubmit({
      title: cleanTitle,
      assignee: assignee.trim() || "Unassigned",
      timeTracking: timeTracking.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <div className="w-full rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">{mode === "edit" ? "Update task" : "New task"}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{mode === "edit" ? "Edit task details" : "Create a task"}</h2>
            <p className="mt-1 text-sm text-slate-500">{mode === "edit" ? "Changes are saved to your board." : "New tasks start in the TO DO column."}</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close task form" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40">
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
          <div>
            <label htmlFor="task-title" className="mb-1.5 block text-sm font-semibold text-slate-700">Task title <span className="text-rose-500">*</span></label>
            <input id="task-title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Fix login validation bug" className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[16px] outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:text-sm" />
          </div>

          <div>
            <label htmlFor="task-assignee" className="mb-1.5 block text-sm font-semibold text-slate-700">Assignee</label>
            <div className="relative">
              <UserRound size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="task-assignee" value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Unassigned" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[16px] outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="task-time" className="mb-1.5 block text-sm font-semibold text-slate-700">Time tracking <span className="font-normal text-slate-400">(optional)</span></label>
            <div className="relative">
              <Clock3 size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="task-time" value={timeTracking} onChange={(event) => setTimeTracking(event.target.value)} placeholder="e.g. 2h / 4h" className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-[16px] outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 sm:text-sm" />
            </div>
          </div>

          {validationError && <p className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-600">{validationError}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={loading} className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} className="h-11 flex-1 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Saving..." : mode === "edit" ? "Save changes" : "Create task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskFormModal;
