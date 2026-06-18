import { useState, useMemo, useEffect } from "react";
import { getBatches, createBatch, updateBatch, deleteBatchApi } from "../../../../api/batchApi";


// ─── Types ────────────────────────────────────────────────────────────────────

interface Batch {
  id: number;
  batch_id: string;
  name: string;
  course: string;
  teacher: string;
  days: string[];
  time: string;
  students: number;
  max_students: number;
  status: "Active" | "Upcoming" | "Completed" | "Inactive";
  fee: number;
  discount: number;
  start_date: string;
  end_date: string;
}


// ─── Constants ────────────────────────────────────────────────────────────────

const COURSES = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science"];
const TEACHERS = ["Rahul Sharma", "Priya Singh", "Amit Verma", "Sunita Mehra"];
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STEPS = ["Basic Info", "Schedule", "Students", "Review"];

// ─── Hardcoded Mock Data ──────────────────────────────────────────────────────



// ─── Helpers ──────────────────────────────────────────────────────────────────

const finalFee = (fee: number, discount: number) =>
  Math.round(fee * (1 - discount / 100));

const weeksBetween = (start: string, end: string) =>
  Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 7));


// ─── Empty Form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  course: "",
  teacher: "",
  days: [] as string[],
  time: "",
  max_students: 40,
  status: "Active" as Batch["status"],
  fee: 0,
  discount: 0,
  start_date: "",
  end_date: "",
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ title, value }: { title: string; value: any }) => {
  const getColor = () => {
    if (title.includes("Active")) return "bg-gradient-to-r from-green-500 to-green-600";
    if (title.includes("Enrolled")) return "bg-gradient-to-r from-purple-500 to-purple-600";
    if (title.includes("Students")) return "bg-gradient-to-r from-orange-400 to-orange-500";
    return "bg-gradient-to-r from-blue-500 to-blue-600";
  };
  return (
    <div className={`${getColor()} text-white p-6 rounded-xl shadow text-center`}>
      <p className="text-sm opacity-90">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
};

// ─── CourseBadge ──────────────────────────────────────────────────────────────

const CourseBadge = ({ course }: { course: string }) => {
  const colors: Record<string, string> = {
    Physics: "bg-blue-100 text-blue-700",
    Chemistry: "bg-purple-100 text-purple-700",
    Mathematics: "bg-green-100 text-green-700",
    Biology: "bg-orange-100 text-orange-700",
    English: "bg-rose-100 text-rose-700",
    "Computer Science": "bg-teal-100 text-teal-700",
  };
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${colors[course] ?? "bg-gray-100 text-gray-600"}`}>
      {course}
    </span>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    Active: "bg-green-100 text-green-700",
    Upcoming: "bg-yellow-100 text-yellow-700",
    Completed: "bg-blue-100 text-blue-700",
    Inactive: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1 text-lg leading-none">&times;</button>
    </div>
  );
};

// ─── DeleteModal ──────────────────────────────────────────────────────────────

const DeleteModal = ({
  batch,
  onConfirm,
  onCancel,
}: {
  batch: Batch;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Batch</h3>
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-800">"{batch.name}"</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition">
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── BatchFormModal — 4-Step Wizard ──────────────────────────────────────────

const BatchFormModal = ({
  editing,
  onClose,
  onSaved,
}: {
  editing: Batch | null;
  onClose: () => void;
  onSaved: (data: typeof EMPTY_FORM, id?: number) => void;
}) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        course: editing.course,
        teacher: editing.teacher,
        days: [...editing.days],
        time: editing.time,
        max_students: editing.max_students,
        status: editing.status,
        fee: editing.fee,
        discount: editing.discount,
        start_date: editing.start_date,
        end_date: editing.end_date,
      });
    } else {
      setForm({ ...EMPTY_FORM });
    }
    setStep(0);
    setErrors({});
  }, [editing]);

  const setField = (key: string, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const toggleDay = (day: string) =>
    setField("days", form.days.includes(day) ? form.days.filter((d) => d !== day) : [...form.days, day]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = "Batch name is required";
      if (!form.course) e.course = "Please select a course";
      if (!form.start_date) e.start_date = "Required";
      if (!form.end_date) e.end_date = "Required";
      if (!form.fee || form.fee <= 0) e.fee = "Enter a valid fee";
    }
    if (step === 1) {
      if (!form.teacher) e.teacher = "Please select a teacher";
      if (!form.days.length) e.days = "Select at least one day";
      // if (!form.class_time)   e.class_time = "Required";
      if (!form.time) e.time = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onSaved(form, editing?.id);
    setSaving(false);
    onClose();
  };

  const weeks =
    form.start_date && form.end_date
      ? Math.max(0, weeksBetween(form.start_date, form.end_date))
      : 0;
  const fee = finalFee(form.fee, form.discount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* Modal Header */}
        <div className="bg-blue-700 rounded-t-xl px-6 pt-5 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-white text-lg font-semibold">
                {editing ? "Edit Batch" : "Add New Batch"}
              </h2>
              <p className="text-blue-200 text-xs mt-0.5">
                Step {step + 1} of {STEPS.length} — {STEPS[step]}
              </p>
            </div>
            <button onClick={onClose} className="text-blue-200 hover:text-white text-2xl leading-none">
              &times;
            </button>
          </div>

          {/* Step tabs */}
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => i < step && setStep(i)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${i === step
                  ? "bg-white text-blue-700"
                  : i < step
                    ? "bg-white/30 text-white cursor-pointer"
                    : "bg-white/10 text-blue-300 cursor-default"
                  }`}
              >
                {i < step ? "✓" : i + 1}. {s.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* ── Step 0: Basic Info ── */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                  placeholder="e.g. Physics Morning Batch"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.course ? "border-red-400" : "border-gray-300"
                      }`}
                    value={form.course}
                    onChange={(e) => setField("course", e.target.value)}
                  >
                    <option value="">Select course</option>
                    {COURSES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex gap-2 mt-0.5">
                    {(["Active", "Upcoming"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setField("status", s)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition ${form.status === s
                          ? s === "Active"
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-yellow-500 text-white border-yellow-500"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.start_date ? "border-red-400" : "border-gray-300"
                      }`}
                    value={form.start_date}
                    onChange={(e) => setField("start_date", e.target.value)}
                  />
                  {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.end_date ? "border-red-400" : "border-gray-300"
                      }`}
                    value={form.end_date}
                    onChange={(e) => setField("end_date", e.target.value)}
                  />
                  {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                </div>
              </div>

              {weeks > 0 && (
                <p className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-2 rounded-lg">
                  Duration: {weeks} weeks
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee (₹/month) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      min={0}
                      className={`w-full border rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fee ? "border-red-400" : "border-gray-300"
                        }`}
                      value={form.fee || ""}
                      onChange={(e) => setField("fee", Number(e.target.value))}
                    />
                  </div>
                  {errors.fee && <p className="text-red-500 text-xs mt-1">{errors.fee}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.discount || ""}
                    onChange={(e) => setField("discount", Number(e.target.value))}
                  />
                </div>
              </div>

              {form.fee > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-green-700">Final payable per month</span>
                  <span className="font-bold text-green-800">₹{fee.toLocaleString()}/mo</span>
                </div>
              )}
            </>
          )}

          {/* ── Step 1: Schedule & Teacher ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Teacher <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEACHERS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setField("teacher", t)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition ${form.teacher === t
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                    >
                      {form.teacher === t && <span className="mr-1.5">✓</span>}
                      {t}
                    </button>
                  ))}
                </div>
                {errors.teacher && <p className="text-red-500 text-xs mt-1">{errors.teacher}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Days <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${form.days.includes(d)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-600 hover:border-blue-400"
                        }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {errors.days && <p className="text-red-500 text-xs mt-1">{errors.days}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.time}
                    onChange={(e) => setField("time", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.max_students}
                    onChange={(e) => setField("max_students", Number(e.target.value))}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Step 2: Students Note ── */}
          {step === 2 && (
            <>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Add students after creating the batch</p>
                <p className="text-xs text-gray-500">
                  Once the batch is saved, go to Batch Detail and use the<br />
                  <strong>"+ Add Student"</strong> button to enroll students.
                </p>
              </div>

              {(form.name || form.course) && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Batch Summary</p>
                  {form.name && <p className="text-sm text-blue-700">Name: <strong>{form.name}</strong></p>}
                  {form.course && <p className="text-sm text-blue-700">Course: <strong>{form.course}</strong></p>}
                  {form.teacher && <p className="text-sm text-blue-700">Teacher: <strong>{form.teacher}</strong></p>}
                  {form.days.length > 0 && <p className="text-sm text-blue-700">Schedule: <strong>{form.days.join(", ")} at {form.time}</strong></p>}
                  <p className="text-sm text-blue-700">Max students: <strong>{form.max_students}</strong></p>
                </div>
              )}
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Review Before Saving</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  ["Batch", form.name || "—"],
                  ["Course", form.course || "—"],
                  ["Teacher", form.teacher || "—"],
                  ["Schedule", form.days.length ? `${form.days.join(", ")} at ${form.time}` : "—"],
                  ["Max seats", String(form.max_students)],
                  ["Fee", form.fee ? `₹${fee.toLocaleString()}/mo` : "—"],
                  ["Duration", form.start_date && form.end_date ? `${form.start_date} → ${form.end_date}` : "—"],
                  ["Status", form.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center px-4 py-3 gap-3">
                    <span className="text-xs text-gray-400 font-semibold w-20 flex-shrink-0">{k}</span>
                    <span className="text-sm text-gray-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
          <button
            onClick={step === 0 ? onClose : prev}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            {step === 0 ? "Cancel" : "← Back"}
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-blue-600" : i < step ? "w-3 bg-green-500" : "w-3 bg-gray-300"
                  }`}
              />
            ))}
          </div>

          {step < STEPS.length - 1 ? (
            <button onClick={next} className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editing ? "Update Batch" : "Save Batch"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── BatchDetail ──────────────────────────────────────────────────────────────

const BatchDetail = ({
  batch,
  onBack,
  onEdit,
  onDelete,
}: {
  batch: Batch;
  onBack: () => void;
  onEdit: (b: Batch) => void;
  onDelete: (b: Batch) => void;
}) => {
  const pct = Math.min(100, Math.round((batch.students / batch.max_students) * 100));
  const fee = finalFee(batch.fee, batch.discount);
  const weeks = weeksBetween(batch.start_date, batch.end_date);
  const MOCK_STUDENTS: any[] = [];

  // const avgAttendance = Math.round(
  //   MOCK_STUDENTS.reduce((a, s) => a + s.attendance, 0) / MOCK_STUDENTS.length
  // );



  const avgAttendance =
    MOCK_STUDENTS.length > 0
      ? Math.round(
        MOCK_STUDENTS.reduce((a, s) => a + s.attendance, 0) / MOCK_STUDENTS.length
      )
      : 0;

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 flex justify-between items-center shadow-md">
        <div>
          <button onClick={onBack} className="text-blue-200 hover:text-white text-sm mb-1 flex items-center gap-1">
            ← Back to Batches
          </button>
          <h1 className="text-3xl font-semibold">{batch.name}</h1>
          <p className="text-blue-200 text-sm mt-1">{batch.batch_id} · {batch.course} · {batch.teacher}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onEdit(batch)} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">
            Edit
          </button>
          <button onClick={() => onDelete(batch)} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <StatCard title="Students Enrolled" value={`${batch.students}/${batch.max_students}`} />
        <StatCard title="Fee / Month" value={`₹${fee.toLocaleString()}`} />
        <StatCard title="Duration" value={`${weeks} weeks`} />
        <StatCard title="Avg. Attendance" value={`${avgAttendance}%`} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 flex-1">

        {/* Left — 2 cols */}
        <div className="md:col-span-2 space-y-6">

          {/* Schedule card */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Class Schedule</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Class Days</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_DAYS.map((d) => (
                    <span
                      key={d}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${batch.days.includes(d)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-50 text-gray-300 border-gray-200"
                        }`}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Class Time</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{batch.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Max per Batch</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{batch.max_students} students</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Course</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{batch.course}</p>
                </div>
              </div>
            </div>

            {/* Enrollment bar */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 font-semibold mb-1.5">
                <span>Enrollment ({batch.students}/{batch.max_students})</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-blue-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Students list */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Students ({MOCK_STUDENTS.length})
              </h3>
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition">
                + Add Student
              </button>
            </div>

            {/* Student table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Attendance</th>
                    <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Fee</th>
                    <th className="p-3 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STUDENTS.map((s) => {
                    const attColor =
                      s.attendance >= 80 ? "text-green-600" :
                        s.attendance >= 60 ? "text-yellow-600" : "text-red-600";
                    const feeCls =
                      s.fee_status === "Paid" ? "bg-green-100 text-green-700" :
                        s.fee_status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700";
                    return (
                      <tr key={s.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{s.name}</td>
                        <td className="p-3 font-mono text-xs text-blue-600">{s.student_id}</td>
                        <td className="p-3 text-gray-500">{s.phone}</td>
                        <td className="p-3">
                          <span className={`font-semibold ${attColor}`}>{s.attendance}%</span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${feeCls}`}>
                            {s.fee_status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button className="text-red-500 hover:underline text-xs font-medium">Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">

          {/* Teacher */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Teacher</h3>
            <p className="text-sm text-gray-700 font-medium">{batch.teacher}</p>
            <p className="text-xs text-gray-400 mt-1">{batch.course} subject</p>
          </div>

          {/* Fee */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Fee Structure</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base fee</span>
                <span className="font-semibold text-gray-800">₹{batch.fee.toLocaleString()}/mo</span>
              </div>
              {batch.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-semibold text-green-600">−{batch.discount}%</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold">
                <span className="text-gray-700">Payable / month</span>
                <span className="text-blue-700">₹{fee.toLocaleString()}</span>
              </div>
            </div>

            {/* Fee status summary */}
            <div className="mt-4 flex gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                {MOCK_STUDENTS.filter(s => s.fee_status === "Paid").length} Paid
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                {MOCK_STUDENTS.filter(s => s.fee_status === "Pending").length} Pending
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                {MOCK_STUDENTS.filter(s => s.fee_status === "Unpaid").length} Unpaid
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Start</span>
                <span className="font-medium text-gray-700">{batch.start_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End</span>
                <span className="font-medium text-gray-700">{batch.end_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="font-medium text-gray-700">{weeks} weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <StatusBadge status={batch.status} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ─── Main Batches Component ───────────────────────────────────────────────────

const Batches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Batch | null>(null);
  const [detailBatch, setDetailBatch] = useState<Batch | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);



  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await getBatches();
      setBatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const handleSaved = async (data: typeof EMPTY_FORM, id?: number) => {
    try {
      if (id) {
        await updateBatch(id, data);
        showToast("Batch updated successfully");
      } else {
        await createBatch(data);
        showToast("Batch added successfully");
      }

      fetchBatches(); // refresh data
    } catch (err) {
      console.error(err);
    }
  };


  const handleDelete = async (id: number) => {
    try {
      await deleteBatchApi(id);
      fetchBatches();
      setDeleteTarget(null);
      showToast("Batch deleted");
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });



  // ── Filters ──────────────────────────────────────────────────────────────
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => (
      (b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.batch_id.toLowerCase().includes(search.toLowerCase()) ||
        b.teacher.toLowerCase().includes(search.toLowerCase()) ||
        b.course.toLowerCase().includes(search.toLowerCase())) &&
      (courseFilter ? b.course === courseFilter : true) &&
      (statusFilter ? b.status === statusFilter : true)
    ));
  }, [batches, search, courseFilter, statusFilter]);

  // ── Actions ───────────────────────────────────────────────────────────────

  // const handleToggleStatus = (batch: Batch) => {
  //   const cycle: Batch["status"][] = ["Active", "Upcoming", "Completed", "Inactive"];
  //   const next = cycle[(cycle.indexOf(batch.status) + 1) % cycle.length];
  //   setBatches((prev) => prev.map((b) => (b.id === batch.id ? { ...b, status: next } : b)));
  //   showToast(`Status changed to ${next}`);
  // };

  const handleToggleStatus = async (batch: Batch) => {
  try {
    const cycle: Batch["status"][] = ["Active", "Upcoming", "Completed", "Inactive"];
    const next = cycle[(cycle.indexOf(batch.status) + 1) % cycle.length];

    await updateBatch(batch.id, { ...batch, status: next }); // 🔥 API call

    fetchBatches(); // 🔥 reload data from backend

    showToast(`Status changed to ${next}`);
  } catch (err) {
    console.error(err);
  }
};



  // ── Detail view ───────────────────────────────────────────────────────────
  if (detailBatch) {
    return (
      <>
        <BatchDetail
          batch={detailBatch}
          onBack={() => setDetailBatch(null)}
          onEdit={(b) => { setEditingBatch(b); setModalOpen(true); setDetailBatch(null); }}
          onDelete={(b) => { setDeleteTarget(b); setDetailBatch(null); }}
        />
        {deleteTarget && (
          <DeleteModal
            batch={deleteTarget}
            onConfirm={() => handleDelete(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-3xl font-semibold">Batches</h1>
          <p className="text-blue-200 text-sm mt-1">Manage batches, students and schedules</p>
        </div>
        <button
          onClick={() => { setEditingBatch(null); setModalOpen(true); }}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          + Add Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Batches" value={batches.length} />
        <StatCard title="Active Batches" value={batches.filter((b) => b.status === "Active").length} />
        <StatCard title="Fully Enrolled" value={batches.filter((b) => b.students >= b.max_students).length} />
        <StatCard title="Total Students" value={batches.reduce((a, b) => a + b.students, 0)} />
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by batch name, course, teacher or ID..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow mt-6 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left">Batch ID</th>
                <th className="p-4 text-left">Batch Name</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Teacher</th>
                <th className="p-4 text-left">Schedule</th>
                <th className="p-4 text-left">Students</th>
                <th className="p-4 text-left">Fee</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBatches.map((batch) => {
                const pct = Math.min(100, Math.round((batch.students / batch.max_students) * 100));
                const fee = finalFee(batch.fee, batch.discount);
                return (
                  <tr key={batch.id} className="border-t hover:bg-gray-50">

                    <td className="p-4 font-mono text-purple-700 text-xs font-semibold">
                      {batch.batch_id}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{batch.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{batch.start_date} → {batch.end_date}</p>
                    </td>

                    <td className="p-4">
                      <CourseBadge course={batch.course} />
                    </td>

                    <td className="p-4 text-gray-700">{batch.teacher}</td>

                    <td className="p-4">
                      <p className="text-xs font-medium text-gray-700">{batch.days.join(", ")}</p>
                      <p className="text-xs text-gray-400">{batch.time}</p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{batch.students}</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-400" : "bg-blue-500"
                              }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">₹{fee.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-1">/mo</span>
                    </td>

                    <td className="p-4">
                      <button onClick={() => handleToggleStatus(batch)}>
                        <StatusBadge status={batch.status} />
                      </button>
                    </td>

                    <td className="p-4 text-center">
                      <button
                        className="text-blue-600 hover:underline mr-3"
                        onClick={() => setDetailBatch(batch)}
                      >
                        View
                      </button>
                      <button
                        className="text-green-600 hover:underline mr-3"
                        onClick={() => { setEditingBatch(batch); setModalOpen(true); }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => setDeleteTarget(batch)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                );
              })}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    No batches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <BatchFormModal
          editing={editingBatch}
          onClose={() => { setModalOpen(false); setEditingBatch(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          batch={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default Batches;