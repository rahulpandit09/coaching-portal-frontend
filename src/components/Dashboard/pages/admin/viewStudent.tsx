import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Student {
  id: number;
  student_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dob?: string;
  course: string;
  batch: string;
  admission_date?: string;
  total_fees?: number;
  paid_amount?: number;
  payment_mode?: string;
  pending_amount?: number;
  status: string;
  comments?: string;
}

type SectionKey = "basicInfo" | "academicDetails" | "feeDetails";

const ViewStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    basicInfo: true,
    academicDetails: true,
    feeDetails: true,
  });

  useEffect(() => {
    fetchStudent();
  }, [id]);

 const fetchStudent = async () => {
  try {
    const res = await fetch(
      `http://localhost:8000/admin/students/${id}/details`
    );

    const data = await res.json();

    setStudent({
      ...data,
      total_fees: data.fee?.total_fees,
      paid_amount: data.fee?.paid_amount,
      pending_amount: data.fee?.pending_amount,
      payment_mode: data.fee?.payment_mode,
      comments: data.fee?.comments,
    });

  } catch (error) {
    console.error("Error fetching student", error);
  }
};



  const toggleSection = (section: SectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!student) {
    return <div className="p-6">Loading...</div>;
  }

  const pending = student.pending_amount;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-blue-700 text-white rounded-xl p-6 shadow-md mb-6">
        <h1 className="text-3xl font-semibold">View Student</h1>
        <p className="text-sm opacity-80 mt-1">
          Student details (Read Only)
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4">

          {/* BASIC INFO */}
          <Section
            title="1. Basic Information"
            isOpen={expandedSections.basicInfo}
            onToggle={() => toggleSection("basicInfo")}
          >
            <Field label="Student ID" value={student.student_id} />
            <Field label="Full Name" value={student.name} />
            <Field label="Phone" value={student.phone} />
            <Field label="Email" value={student.email} />
          </Section>

          {/* ACADEMIC */}
          <Section
            title="2. Academic Details"
            isOpen={expandedSections.academicDetails}
            onToggle={() => toggleSection("academicDetails")}
          >
            <Field label="Course" value={student.course} />
            <Field label="Batch" value={student.batch} />
            <Field label="Admission Date" value={student.admission_date} />
          </Section>

          {/* FEES */}
          <Section
            title="3. Fee Details"
            isOpen={expandedSections.feeDetails}
            onToggle={() => toggleSection("feeDetails")}
          >
            <Field label="Total Fees" value={student.total_fees} />
            <Field label="Paid Amount" value={student.paid_amount} />
            <Field label="Pending" value={pending} />
            <Field label="Payment Mode" value={student.payment_mode} />
            <Field label="Status" value={student.status} />
            <Field label="comments" value={student.comments} />
          </Section>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => navigate("/admin/manage-students")}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Accordion Section */
const Section = ({
  title,
  isOpen,
  onToggle,
  children,
}: any) => (
  <div className="border border-gray-200 rounded-lg mb-4">
    <button
      onClick={onToggle}
      className="w-full flex justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100"
    >
      <span className="font-semibold text-gray-800">{title}</span>
      <span>{isOpen ? "▲" : "▼"}</span>
    </button>

    {isOpen && (
      <div className="p-4 bg-white border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    )}
  </div>
);

/* Reusable Field */
const Field = ({ label, value }: any) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">
      {label}
    </label>
    <div className="w-full border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-600">
      {value ?? "-"}
    </div>
  </div>
);

export default ViewStudent;