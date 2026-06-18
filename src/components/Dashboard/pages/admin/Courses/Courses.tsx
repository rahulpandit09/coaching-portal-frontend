import { useState, useMemo, useEffect } from "react";
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus
} from "../../../../api/courseApi";


// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  id: number;
  course_id: string;
  name: string;
  subject: string;
  teacher_name: string;
  batches: string[];
  students: number;
  max_students: number;
  status: "Active" | "Inactive";
  fee_type: "Monthly" | "Full Course";
  fee_amount: number;
  discount: number;
  fee_due_day: number;
  start_date: string;
  end_date: string;
  class_days: string[];
  class_time: string;
  description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science"];
const ALL_BATCHES = ["Batch A", "Batch B", "Batch C", "Batch D"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TEACHERS = ["Rahul Sharma", "Priya Singh", "Amit Verma", "Sunita Mehra"];

// ─── Hardcoded Mock Data ──────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

const finalFee = (amount: number, discount: number) =>
  Math.round(amount * (1 - discount / 100));

const weeksBetween = (start: string, end: string) =>
  Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 7)
  );


// ─── Empty Form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: "",
  subject: "",
  teacher_name: "",
  batches: [] as string[],
  status: "Active" as "Active" | "Inactive",
  fee_type: "Monthly" as "Monthly" | "Full Course",
  fee_amount: 0,
  discount: 0,
  fee_due_day: 5,
  start_date: "",
  end_date: "",
  class_days: [] as string[],
  class_time: "",
  description: "",
  max_students: 60,
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ title, value }: { title: string; value: any }) => {
  const getColor = () => {
    if (title.includes("Active")) return "bg-gradient-to-r from-green-500 to-green-600";
    if (title.includes("Subjects")) return "bg-gradient-to-r from-purple-500 to-purple-600";
    if (title.includes("Enrolled")) return "bg-gradient-to-r from-orange-400 to-orange-500";
    return "bg-gradient-to-r from-blue-500 to-blue-600";
  };
  return (
    <div className={`${getColor()} text-white p-6 rounded-xl shadow text-center`}>
      <p className="text-sm opacity-90">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
};

// ─── SubjectBadge ─────────────────────────────────────────────────────────────

const SubjectBadge = ({ subject }: { subject: string }) => {
  const colors: Record<string, string> = {
    Physics: "bg-blue-100 text-blue-700",
    Chemistry: "bg-purple-100 text-purple-700",
    Mathematics: "bg-green-100 text-green-700",
    Biology: "bg-orange-100 text-orange-700",
    English: "bg-rose-100 text-rose-700",
    "Computer Science": "bg-teal-100 text-teal-700",
  };
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-medium ${colors[subject] ?? "bg-gray-100 text-gray-600"}`}>
      {subject}
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
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
      <button onClick={onClose} className="opacity-60 hover:opacity-100 ml-1 text-lg leading-none">
        &times;
      </button>
    </div>
  );
};

// ─── DeleteModal ──────────────────────────────────────────────────────────────

const DeleteModal = ({
  course,
  onConfirm,
  onCancel,
}: {
  course: Course;
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
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Course</h3>
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to delete{" "}
        <span className="font-semibold text-gray-800">"{course.name}"</span>?
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

// ─── CourseFormModal — 5-Step Wizard ─────────────────────────────────────────

const STEPS = ["Basic Info", "Schedule", "Assignment", "Fees", "Review"];

const CourseFormModal = ({
  editing,
  onClose,
  onSaved,
}: {
  editing: Course | null;
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
        subject: editing.subject,
        teacher_name: editing.teacher_name,
        batches: [...editing.batches],
        status: editing.status,
        fee_type: editing.fee_type,
        fee_amount: editing.fee_amount,
        discount: editing.discount,
        fee_due_day: editing.fee_due_day,
        start_date: editing.start_date,
        end_date: editing.end_date,
        class_days: [...editing.class_days],
        class_time: editing.class_time,
        description: editing.description,
        max_students: editing.max_students,
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

  const toggleArray = (key: string, arr: string[], val: string) =>
    setField(key, arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = "Course name is required";
      if (!form.subject) e.subject = "Please select a subject";
    }
    if (step === 1) {
      if (!form.start_date) e.start_date = "Required";
      if (!form.end_date) e.end_date = "Required";
      if (!form.class_days.length) e.class_days = "Select at least one day";
      if (!form.class_time) e.class_time = "Required";
    }
    if (step === 2) {
      if (!form.teacher_name) e.teacher_name = "Please select a teacher";
      if (!form.batches.length) e.batches = "Select at least one batch";
    }
    if (step === 3) {
      if (!form.fee_amount || form.fee_amount <= 0) e.fee_amount = "Enter a valid fee amount";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    setSaving(true);
    // Simulate save delay
    await new Promise((r) => setTimeout(r, 500));
    onSaved(form, editing?.id);
    setSaving(false);
    onClose();
  };

  const weeks =
    form.start_date && form.end_date
      ? Math.max(0, weeksBetween(form.start_date, form.end_date))
      : 0;

  const fee = finalFee(form.fee_amount, form.discount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* Modal Header */}
        <div className="bg-blue-700 rounded-t-xl px-6 pt-5 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-white text-lg font-semibold">
                {editing ? "Edit Course" : "Add New Course"}
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
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                    }`}
                  placeholder="e.g. Physics Foundation"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.subject ? "border-red-400" : "border-gray-300"
                      }`}
                    value={form.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                  >
                    <option value="">Select subject</option>
                    {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex gap-2 mt-0.5">
                    {["Active", "Inactive"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setField("status", s)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition ${form.status === s
                            ? s === "Active"
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-gray-600 text-white border-gray-600"
                            : "border-gray-300 text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Brief overview of this course..."
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>
            </>
          )}

          {/* ── Step 1: Schedule ── */}
          {step === 1 && (
            <>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Days <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleArray("class_days", form.class_days, d)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${form.class_days.includes(d)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-600 hover:border-blue-400"
                        }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {errors.class_days && <p className="text-red-500 text-xs mt-1">{errors.class_days}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class_time ? "border-red-400" : "border-gray-300"
                      }`}
                    value={form.class_time}
                    onChange={(e) => setField("class_time", e.target.value)}
                  />
                  {errors.class_time && <p className="text-red-500 text-xs mt-1">{errors.class_time}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students / Batch</label>
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

          {/* ── Step 2: Assignment ── */}
          {step === 2 && (
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
                      onClick={() => setField("teacher_name", t)}
                      className={`px-4 py-3 rounded-lg border text-sm font-medium text-left transition ${form.teacher_name === t
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                    >
                      {form.teacher_name === t && <span className="mr-1.5">✓</span>}
                      {t}
                    </button>
                  ))}
                </div>
                {errors.teacher_name && <p className="text-red-500 text-xs mt-1">{errors.teacher_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Batches <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_BATCHES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggleArray("batches", form.batches, b)}
                      className={`py-3 rounded-lg border text-sm font-medium transition ${form.batches.includes(b)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-600 hover:border-blue-300"
                        }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                {errors.batches && <p className="text-red-500 text-xs mt-1">{errors.batches}</p>}
              </div>
            </>
          )}

          {/* ── Step 3: Fees ── */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                <div className="flex gap-3">
                  {(["Monthly", "Full Course"] as const).map((ft) => (
                    <button
                      key={ft}
                      type="button"
                      onClick={() => setField("fee_type", ft)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${form.fee_type === ft
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-gray-300 text-gray-600 hover:border-blue-400"
                        }`}
                    >
                      {ft === "Monthly" ? "Monthly Payment" : "Full Course (One-time)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      min={0}
                      className={`w-full border rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fee_amount ? "border-red-400" : "border-gray-300"
                        }`}
                      value={form.fee_amount || ""}
                      onChange={(e) => setField("fee_amount", Number(e.target.value))}
                    />
                  </div>
                  {errors.fee_amount && <p className="text-red-500 text-xs mt-1">{errors.fee_amount}</p>}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Day (day of month)</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.fee_due_day}
                  onChange={(e) => setField("fee_due_day", Number(e.target.value))}
                />
              </div>

              {form.fee_amount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">Fee Summary</p>
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Base fee ({form.fee_type})</span>
                    <span className="font-semibold">₹{form.fee_amount.toLocaleString()}</span>
                  </div>
                  {form.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({form.discount}%)</span>
                      <span>−₹{Math.round(form.fee_amount * form.discount / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-green-900 border-t border-green-200 pt-1.5">
                    <span>Final payable</span>
                    <span>₹{fee.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700">Review Before Saving</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  ["Course", form.name || "—"],
                  ["Subject", form.subject || "—"],
                  ["Teacher", form.teacher_name || "—"],
                  ["Batches", form.batches.join(", ") || "—"],
                  ["Schedule", form.class_days.length ? `${form.class_days.join(", ")} at ${form.class_time}` : "—"],
                  ["Fee", form.fee_amount ? `₹${fee.toLocaleString()} / ${form.fee_type}` : "—"],
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
              {editing ? "Update Course" : "Save Course"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── CourseDetail ─────────────────────────────────────────────────────────────

const CourseDetail = ({
  course,
  onBack,
  onEdit,
  onDelete,
}: {
  course: Course;
  onBack: () => void;
  onEdit: (c: Course) => void;
  onDelete: (c: Course) => void;
}) => {
  const pct = Math.min(100, Math.round((course.students / course.max_students) * 100));
  const fee = finalFee(course.fee_amount, course.discount);
  const weeks = weeksBetween(course.start_date, course.end_date);

  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 flex justify-between items-center shadow-md">
        <div>
          <button onClick={onBack} className="text-blue-200 hover:text-white text-sm mb-1 flex items-center gap-1">
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-semibold">{course.name}</h1>
          <p className="text-blue-200 text-sm mt-1">{course.course_id} · {course.subject}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onEdit(course)} className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100">
            Edit
          </button>
          <button onClick={() => onDelete(course)} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard title="Students Enrolled" value={`${course.students}/${course.max_students}`} />
        <StatCard title="Fee Amount" value={`₹${fee.toLocaleString()}`} />
        <StatCard title="Duration" value={`${weeks} weeks`} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 flex-1">

        {/* Left */}
        <div className="md:col-span-2 space-y-6">

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">About This Course</h3>
            <p className="text-sm text-gray-600">{course.description || "No description provided."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{course.subject}</span>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${course.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {course.status}
              </span>
              {course.batches.map((b) => (
                <span key={b} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{b}</span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Class Schedule</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Class Days</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <span
                      key={d}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${course.class_days.includes(d)
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
                  <p className="text-sm font-semibold text-gray-800 mt-1">{course.class_time || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Max per Batch</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{course.max_students} students</p>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 font-semibold mb-1.5">
                <span>Enrollment ({course.students}/{course.max_students})</span>
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
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Teacher</h3>
            <p className="text-sm text-gray-700 font-medium">{course.teacher_name}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Fee Structure</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Base fee</span>
                <span className="font-semibold text-gray-800">₹{course.fee_amount.toLocaleString()}</span>
              </div>
              {course.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-semibold text-green-600">−{course.discount}%</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 font-bold">
                <span className="text-gray-700">Payable ({course.fee_type})</span>
                <span className="text-blue-700">₹{fee.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Due: {course.fee_due_day}th of each month</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Timeline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Start</span>
                <span className="font-medium text-gray-700">{course.start_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End</span>
                <span className="font-medium text-gray-700">{course.end_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="font-medium text-gray-700">{weeks} weeks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Courses Component ───────────────────────────────────────────────────

const Courses = () => {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [, setLoading] = useState(false);
  

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      showToast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ SAVE (Create / Update)
const handleSaved = async (data: typeof EMPTY_FORM, id?: number) => {
  try {
    if (id) {
      await updateCourse(id, data);
      showToast("Course updated successfully");
    } else {
      await createCourse(data);
      showToast("Course created successfully");
    }
    fetchCourses();
  } catch {
    showToast("Failed to save course", "error");
  }
};

// ✅ DELETE
const handleDelete = async (id: number) => {
  try {
    await deleteCourse(id);
    showToast("Course deleted successfully");
    setDeleteTarget(null);
    fetchCourses();
  } catch {
    showToast("Failed to delete course", "error");
  }
};

// ✅ STATUS TOGGLE
const handleToggleStatus = async (course: Course) => {
  try {
    const newStatus = course.status === "Active" ? "Inactive" : "Active";
    await updateCourseStatus(course.id, newStatus);
    showToast("Status updated");
    fetchCourses();
  } catch {
    showToast("Failed to update status", "error");
  }
};

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });

  // ── Filters ──────────────────────────────────────────────────────────────
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => (
      (course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.course_id.toLowerCase().includes(search.toLowerCase()) ||
        course.teacher_name.toLowerCase().includes(search.toLowerCase())) &&
      (subjectFilter ? course.subject === subjectFilter : true) &&
      (batchFilter ? course.batches.includes(batchFilter) : true) &&
      (statusFilter ? course.status === statusFilter : true)
    ));
  }, [courses, search, subjectFilter, batchFilter, statusFilter]);


 

 

  // ── Detail view ───────────────────────────────────────────────────────────
  if (detailCourse) {
    return (
      <>
        <CourseDetail
          course={detailCourse}
          onBack={() => setDetailCourse(null)}
          onEdit={(c) => {
            setEditingCourse(c);
            setModalOpen(true);
            setDetailCourse(null);
          }}
          onDelete={(c) => {
            setDeleteTarget(c);
            setDetailCourse(null);
          }}
        />
        {deleteTarget && (
          <DeleteModal
            course={deleteTarget}
            onConfirm={() => handleDelete(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-3xl font-semibold">Courses</h1>
          <p className="text-blue-200 text-sm mt-1">Manage courses, subjects and assignments</p>
        </div>
        <button
          onClick={() => { setEditingCourse(null); setModalOpen(true); }}
          className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
        >
          + Add Course
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <StatCard title="Total Courses" value={courses.length} />
        <StatCard title="Active Courses" value={courses.filter((c) => c.status === "Active").length} />
        <StatCard title="Subjects Offered" value={new Set(courses.map((c) => c.subject)).size} />
        <StatCard title="Total Enrolled" value={courses.reduce((a, c) => a + c.students, 0)} />
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow mt-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name, teacher or ID..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
          >
            <option value="">All Batches</option>
            {ALL_BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            className="border border-gray-300 rounded-lg px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
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
                <th className="p-4 text-left">Course ID</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Subject</th>
                <th className="p-4 text-left">Teacher</th>
                <th className="p-4 text-left">Batches</th>
                <th className="p-4 text-left">Students</th>
                <th className="p-4 text-left">Fee</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-t hover:bg-gray-50">

                  <td className="p-4 font-mono text-blue-700 text-xs font-semibold">
                    {course.course_id}
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{course.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{course.description}</p>
                  </td>

                  <td className="p-4">
                    <SubjectBadge subject={course.subject} />
                  </td>

                  <td className="p-4 text-gray-700">{course.teacher_name}</td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {course.batches.map((b) => (
                        <span key={b} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md font-medium">
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{course.students}</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${course.students / course.max_students > 0.9
                              ? "bg-red-500"
                              : course.students / course.max_students > 0.7
                                ? "bg-yellow-400"
                                : "bg-blue-500"
                            }`}
                          style={{ width: `${Math.min(100, (course.students / course.max_students) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-800">
                      ₹{finalFee(course.fee_amount, course.discount).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      /{course.fee_type === "Monthly" ? "mo" : "full"}
                    </span>
                  </td>

                  <td className="p-4">
                    <button onClick={() => handleToggleStatus(course)}>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${course.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                        }`}>
                        {course.status}
                      </span>
                    </button>
                  </td>

                  <td className="p-4 text-center">
                    <button
                      className="text-blue-600 hover:underline mr-3"
                      onClick={() => setDetailCourse(course)}
                    >
                      View
                    </button>
                    <button
                      className="text-green-600 hover:underline mr-3"
                      onClick={() => { setEditingCourse(course); setModalOpen(true); }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => setDeleteTarget(course)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}

              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <CourseFormModal
          editing={editingCourse}
          onClose={() => { setModalOpen(false); setEditingCourse(null); }}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          course={deleteTarget}
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

export default Courses;