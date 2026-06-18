import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Student {
    id: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
    gender?: string;
    course: string;
    batch: string;
    admissionDate: string;
    totalFees: number;
    paidAmount: number;
    pending: number;
    paymentMode?: string;
    status: string;
    notes?: string;
    createdDate: string;
}

type FormType = Omit<Student, "id" | "createdDate">;
type SectionKey = "basicInfo" | "academicDetails" | "feeDetails";

const AddStudent = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<FormType>({
        name: "",
        phone: "",
        email: "",
        address: "",
        gender: "",
        course: "",
        batch: "",
        admissionDate: "",
        totalFees: 0,
        paidAmount: 0,
        pending: 0,
        paymentMode: "",
        notes: "",
        status: "Unpaid",
    });

    const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
        basicInfo: true,
        academicDetails: true,
        feeDetails: true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormType, string>>>({});
    const [generatedId, setGeneratedId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const studentSections = [
        { id: "basicInfo" as SectionKey, title: "1. Basic Information" },
        { id: "academicDetails" as SectionKey, title: "2. Academic Details" },
        { id: "feeDetails" as SectionKey, title: "3. Fee Details" },
    ];

    // Section → field mapping for error badge detection
    const sectionFields: Record<SectionKey, (keyof FormType)[]> = {
        basicInfo: ["name", "phone", "email"],
        academicDetails: ["course", "batch", "admissionDate"],
        feeDetails: ["totalFees", "paidAmount", "paymentMode"],
    };

    const hasErrorsInSection = (sectionId: SectionKey): boolean => {
        return sectionFields[sectionId].some((field) => !!errors[field]);
    };

    const toggleSection = (section: SectionKey) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    /* ===============================
       1️⃣ Auto Pending + Status Logic
    ================================= */
    useEffect(() => {
        const total = form.totalFees;
        const paid = form.paidAmount;
        const pending = total - paid;

        let status = "Unpaid";

        if (paid === 0) {
            status = "Unpaid";
        } else if (paid < total) {
            status = "Pending";
        } else if (paid === total) {
            status = "Paid";
        } else {
            status = "Overpaid";
        }

        setForm((prev) => ({
            ...prev,
            pending,
            status,
        }));
    }, [form.totalFees, form.paidAmount]);

    /* ===============================
       2️⃣ Auto Generate Student ID
    ================================= */
    useEffect(() => {
        fetchNextId();
    }, []);

    const fetchNextId = async () => {
        try {
            const res = await fetch("http://localhost:8000/admin/students/next-id");
            const data = await res.json();
            setGeneratedId(data.student_id);
        } catch (error) {
            console.error("Failed to fetch student ID", error);
            setGeneratedId("STU-001"); // fallback so UI doesn't look broken
        }
    };

    /* ===============================
       3️⃣ Validation Logic (FIXED)
    ================================= */
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormType, string>> = {};

        // Name
        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Phone — FIX: use else-if so empty doesn't trigger length check
        if (!form.phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^\d{10}$/.test(form.phone.trim())) {
            newErrors.phone = "Phone must be exactly 10 digits";
        }

        // Course & Batch
        if (!form.course) newErrors.course = "Course is required";
        if (!form.batch) newErrors.batch = "Batch is required";

        // Fees — FIX: guard against 0 only when user has set it
        if (!form.totalFees || form.totalFees <= 0) {
            newErrors.totalFees = "Total fees must be greater than 0";
        }
        if (form.paidAmount < 0) {
            newErrors.paidAmount = "Paid amount cannot be negative";
        }
        // Payment mode only required if something was paid
        if (form.paidAmount > 0 && !form.paymentMode) {
            newErrors.paymentMode = "Select payment mode";
        }

        setErrors(newErrors);

        // Auto-expand sections that have errors so user can see them
        const sectionsWithErrors = (Object.keys(sectionFields) as SectionKey[]).filter(
            (sectionId) => sectionFields[sectionId].some((field) => !!newErrors[field])
        );
        if (sectionsWithErrors.length > 0) {
            setExpandedSections((prev) => {
                const updated = { ...prev };
                sectionsWithErrors.forEach((s) => (updated[s] = true));
                return updated;
            });
        }

        return Object.keys(newErrors).length === 0;
    };

    /* ===============================
       4️⃣ Save Student (FIXED)
    ================================= */
    const handleSubmit = async () => {
        const isValid = validate();
        if (!isValid) return; // stop here if invalid

        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/admin/students/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    phone: form.phone.trim(),
                    email: form.email?.trim() || "",
                    address: form.address?.trim() || "",
                    course: form.course,
                    batch: form.batch,
                    admission_date: form.admissionDate || null,
                    total_fees: form.totalFees,
                    paid_amount: form.paidAmount,
                    payment_mode: form.paymentMode || null,
                    comments: form.notes?.trim() || "",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert("Error: " + JSON.stringify(data.detail));
                setLoading(false);
                return;
            }

            alert("Student Created Successfully!");
            navigate("/admin/manage-students");
        } catch (error) {
            console.error("Error saving student:", error);
            alert("Server Error. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       5️⃣ Reusable input class helper
    ================================= */
    // const inputClass = (field: keyof FormType) =>
    //     `w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
    //         errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    //     }`;
    // const inputClass = (field: keyof FormType) =>
    // `w-full border rounded-md p-2 transition
    //  focus:outline-none focus:border-gray-400
    //  ${
    //     errors[field]
    //         ? "border-red-400 bg-red-50 focus:border-red-500"
    //         : "border-gray-300 bg-white"
    //  }`;
    const inputClass = (field: keyof FormType) =>
        `w-full border rounded-lg p-2.5 transition duration-200
     focus:outline-none focus:border-gray-400 focus:shadow-sm
     ${errors[field]
            ? "border-red-400 bg-red-50 focus:border-red-500"
            : "border-gray-300 bg-white"
        }`;



    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            {/* Header */}
            <div className="bg-blue-700 text-white rounded-xl p-6 shadow-md mb-6">
                <h1 className="text-3xl font-semibold">Add Student</h1>
                <p className="text-sm opacity-80 mt-1">
                    Fill student information and admission details
                </p>
            </div>

            {/* <div className="max-w-5xl mx-auto space-y-6"> */}
            {/* <div className="w-full space-y-6"> */}
                <div className="max-w-6xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="p-4">

                        {studentSections.map((section) => (
                            // <div key={section.id}  className="border rounded-lg mb-2">
                            <div key={section.id} className="border border-gray-200 rounded-lg mb-4">

                                {/* Section Header */}
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.id)}
                                    // className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-t-lg transition"
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg transition"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-800">
                                            {section.title}
                                        </span>
                                        {/* Error badge — visible even when section is collapsed */}
                                        {hasErrorsInSection(section.id) && (
                                            <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                                Has errors
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-gray-500 text-xs">
                                        {expandedSections[section.id] ? "▲" : "▼"}
                                    </span>
                                </button>

                                {/* Section Body */}
                                {expandedSections[section.id] && (
                                    // <div className="p-4 bg-white border-t">
                                    <div className="p-4 bg-white border-t border-gray-200">

                                        {/* ========================= */}
                                        {/* 1️⃣ BASIC INFO SECTION    */}
                                        {/* ========================= */}
                                        {section.id === "basicInfo" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Student ID
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={generatedId}
                                                        readOnly
                                                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Full Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.name}
                                                        onChange={(e) =>
                                                            setForm({ ...form, name: e.target.value })
                                                        }
                                                        placeholder="Enter full name"
                                                        className={inputClass("name")}
                                                    />
                                                    {errors.name && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors.name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Phone <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={form.phone}
                                                        onChange={(e) =>
                                                            setForm({ ...form, phone: e.target.value })
                                                        }
                                                        placeholder="10-digit phone number"
                                                        maxLength={10}
                                                        className={inputClass("phone")}
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors.phone}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={form.email}
                                                        onChange={(e) =>
                                                            setForm({ ...form, email: e.target.value })
                                                        }
                                                        placeholder="student@email.com"
                                                        className={inputClass("email")}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors.email}
                                                        </p>
                                                    )}
                                                </div>

                                            </div>
                                        )}

                                        {/* ========================= */}
                                        {/* 2️⃣ ACADEMIC DETAILS      */}
                                        {/* ========================= */}
                                        {section.id === "academicDetails" && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Course <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={form.course}
                                                        onChange={(e) =>
                                                            setForm({ ...form, course: e.target.value })
                                                        }
                                                        className={inputClass("course")}
                                                    >
                                                        <option value="">Select Course</option>
                                                        <option value="Physics">Physics</option>
                                                        <option value="Math">Math</option>
                                                    </select>
                                                    {errors.course && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors.course}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Batch <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={form.batch}
                                                        onChange={(e) =>
                                                            setForm({ ...form, batch: e.target.value })
                                                        }
                                                        className={inputClass("batch")}
                                                    >
                                                        <option value="">Select Batch</option>
                                                        <option value="Batch A">Batch A</option>
                                                        <option value="Batch B">Batch B</option>
                                                    </select>
                                                    {errors.batch && (
                                                        <p className="text-red-500 text-xs mt-1">
                                                            {errors.batch}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Admission Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={form.admissionDate}
                                                        onChange={(e) =>
                                                            setForm({ ...form, admissionDate: e.target.value })
                                                        }
                                                        className={inputClass("admissionDate")}
                                                    />
                                                </div>

                                            </div>
                                        )}

                                        {/* ========================= */}
                                        {/* 3️⃣ FEE DETAILS           */}
                                        {/* ========================= */}
                                        {section.id === "feeDetails" && (
                                            <div className="space-y-6">

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            Total Fees <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={form.totalFees === 0 ? "" : form.totalFees}
                                                            onChange={(e) =>
                                                                setForm({
                                                                    ...form,
                                                                    totalFees: e.target.value === "" ? 0 : Number(e.target.value),
                                                                })
                                                            }
                                                            placeholder="Enter total fees"
                                                            className={inputClass("totalFees")}
                                                        />
                                                        {errors.totalFees && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {errors.totalFees}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            Paid Amount
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={form.paidAmount === 0 ? "" : form.paidAmount}
                                                            onChange={(e) =>
                                                                setForm({
                                                                    ...form,
                                                                    paidAmount: e.target.value === "" ? 0 : Number(e.target.value),
                                                                })
                                                            }
                                                            placeholder="Amount paid"
                                                            className={inputClass("paidAmount")}
                                                        />
                                                        {errors.paidAmount && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {errors.paidAmount}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            Pending (Auto)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={form.pending}
                                                            readOnly
                                                            className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                        />
                                                    </div>

                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            Payment Mode
                                                            {form.paidAmount > 0 && (
                                                                <span className="text-red-500"> *</span>
                                                            )}
                                                        </label>
                                                        <select
                                                            value={form.paymentMode}
                                                            onChange={(e) =>
                                                                setForm({ ...form, paymentMode: e.target.value })
                                                            }
                                                            className={inputClass("paymentMode")}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Cash">Cash</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Bank Transfer">Bank Transfer</option>
                                                        </select>
                                                        {errors.paymentMode && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {errors.paymentMode}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 text-gray-700">
                                                            Status (Auto)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={form.status}
                                                            readOnly
                                                            className={`w-full border rounded-md p-2 cursor-not-allowed font-medium ${form.status === "Paid"
                                                                    ? "bg-green-50 border-green-300 text-green-700"
                                                                    : form.status === "Pending"
                                                                        ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                                                                        : form.status === "Overpaid"
                                                                            ? "bg-purple-50 border-purple-300 text-purple-700"
                                                                            : "bg-gray-100 border-gray-300 text-gray-500"
                                                                }`}

                                                        />
                                                    </div>

                                                </div>

                                                {/* Notes */}
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                                        Comments
                                                    </label>
                                                    <textarea
                                                        value={form.notes}
                                                        onChange={(e) =>
                                                            setForm({ ...form, notes: e.target.value })
                                                        }
                                                        rows={3}
                                                        placeholder="Any additional Comments..."
                                                        // className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                                        className="w-full border border-gray-300 rounded-md p-2 transition focus:outline-none focus:border-gray-400"
                                                    />
                                                </div>

                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        ))}

                    </div>

                    {/* Action Bar */}
                    {/* <div className="flex justify-end gap-3 p-3 border-t bg-gray-50 rounded-b-xl"> */}
                    <div className="flex justify-end gap-3 p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/manage-students")}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                "Save Student"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudent;