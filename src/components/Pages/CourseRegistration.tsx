import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StudentFormData {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    gender: string;
    address: string;
    course: string;
    batch: string;
    mode: string;
    qualification: string;
    school: string;
    parentContact: string;
    agree: boolean;
}

interface Errors {
    [key: string]: string;
}

const StudentRegistration: React.FC = () => {
    const [formData, setFormData] = useState<StudentFormData>({
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        address: "",
        course: "",
        batch: "",
        mode: "Online",
        qualification: "",
        school: "",
        parentContact: "",
        agree: false,
    });

    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    // ================= HANDLE CHANGE =================
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;

        let updatedValue = value;

        if (name === "parentContact" || name === "phone") {
            updatedValue = value.replace(/[^0-9]/g, "");
        }

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : updatedValue,
        });

        setErrors({ ...errors, [name]: "" });
    };

    // ================= VALIDATION =================
    const validate = () => {
        const newErrors: Errors = {};

        // Required fields (EXCEPT parentContact)
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== "agree" && key !== "parentContact" && !value) {
                newErrors[key] = "This field is required";
            }
        });

        // Email format
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // Phone (MANDATORY + EXACT 10 digits)
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone must be exactly 10 digits";
        }


        // Privacy checkbox
        if (!formData.agree) {
            newErrors.agree = "You must accept Privacy Policy";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // ================= SUBMIT =================
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:8000/students/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (data.detail) {
                    const backendErrors: Errors = {};
                    data.detail.forEach((err: any) => {
                        backendErrors[err.loc[1]] = err.msg;
                    });
                    setErrors(backendErrors);
                }
                setLoading(false);
                return;
            }

            alert("Student Registered Successfully 🎉");

            setFormData({
                fullName: "",
                email: "",
                phone: "",
                dob: "",
                gender: "",
                address: "",
                course: "",
                batch: "",
                mode: "Online",
                qualification: "",
                school: "",
                parentContact: "",
                agree: false,
            });

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setFormData({
            ...formData,
            mode: formData.mode === "Online" ? "Offline" : "Online",
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-yellow-300 p-6">
            <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl p-10">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                    Student Registration Form
                </h1>
                <p className="text-gray-500 mb-8">
                    Fill in the form to register for a course.
                </p>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* LEFT SIDE */}
                        <div className="space-y-8">

                            <div>
                                <SectionTitle title="👤 Personal Information" />
                                <Input label="Full Name" name="fullName" formData={formData} handleChange={handleChange} error={errors.fullName} />
                                <Input label="Email" name="email" formData={formData} handleChange={handleChange} error={errors.email} />
                                {/* Phone Number */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-1 text-gray-700">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>

                                    <div className="flex">
                                        {/* +91 Prefix */}
                                        <div className="px-3 flex items-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-700">
                                            +91
                                        </div>

                                        {/* Number Input */}
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            maxLength={10}
                                            className={`w-full border rounded-r-lg px-3 py-2 focus:outline-none ${errors.phone ? "border-red-500" : "border-gray-300"
                                                }`}
                                            placeholder="Enter 10 digit mobile number"
                                        />
                                    </div>

                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input type="date" label="Date of Birth" name="dob" formData={formData} handleChange={handleChange} error={errors.dob} />
                                    <Select label="Gender" name="gender" options={["Male", "Female", "Other"]} formData={formData} handleChange={handleChange} error={errors.gender} />
                                </div>
                            </div>

                            <div>
                                <SectionTitle title="🏠 Additional Info" />
                                <TextArea label="Address" name="address" formData={formData} handleChange={handleChange} error={errors.address} />
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="space-y-8">
                            <div>
                                <SectionTitle title="🎓 Academic Information" />

                                <Select label="Course" name="course" options={["Physics", "Mathematics", "Chemistry"]} formData={formData} handleChange={handleChange} error={errors.course} />
                                <Select
                                    label="Batch"
                                    name="batch"
                                    options={[
                                        "Morning (7AM – 9AM)",
                                        "Evening (5PM – 7PM)",
                                        "Night (8PM – 10PM)",
                                    ]}
                                    formData={formData}
                                    handleChange={handleChange}
                                    error={errors.batch}
                                />

                                {/* MODE TOGGLE */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-medium">Mode</span>
                                    <div className="flex items-center gap-3">
                                        <span className={formData.mode === "Online" ? "text-green-600 font-medium" : ""}>Online</span>
                                        <div
                                            onClick={toggleMode}
                                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${formData.mode === "Online"
                                                ? "bg-green-500"
                                                : "bg-gray-300"
                                                }`}
                                        >
                                            <div
                                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${formData.mode === "Online"
                                                    ? "translate-x-6"
                                                    : ""
                                                    }`}
                                            />
                                        </div>
                                        <span className={formData.mode === "Offline" ? "text-green-600 font-medium" : ""}>Offline</span>
                                    </div>
                                </div>
                                <Select
                                    label="Class"
                                    name="qualification"
                                    options={Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)}
                                    formData={formData}
                                    handleChange={handleChange}
                                    error={errors.qualification}
                                />

                                <Input label="School / College" name="school" formData={formData} handleChange={handleChange} error={errors.school} />
                            </div>

                            {/* Parent Contact */}
                            {/* Parent Contact */}
                            <div>
                                <SectionTitle title="👨‍👩‍👧 Parent Contact" />

                                <label className="block text-sm font-medium mb-1 text-gray-700">
                                    Parent Contact <span className="text-gray-400"></span>
                                </label>

                                <div className="flex">
                                    <div className="px-3 flex items-center bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        name="parentContact"
                                        value={formData.parentContact}
                                        onChange={handleChange}
                                        maxLength={10}
                                        className={`w-full border rounded-r-lg px-3 py-2 ${errors.parentContact ? "border-red-500" : "border-gray-300"
                                            }`}
                                        placeholder="Enter 10 digit number "
                                    />
                                </div>

                                {errors.parentContact && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.parentContact}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between mt-6">
                        <label className="flex items-center gap-3 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                name="agree"
                                checked={formData.agree}
                                onChange={handleChange}
                                className="hidden"
                            />
                            <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center ${formData.agree
                                    ? "bg-green-600 border-green-600"
                                    : "border-gray-300"
                                    }`}
                            >
                                {formData.agree && (
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            I agree with the{" "}
                            <span className="text-green-600 font-medium hover:underline">
                                Privacy Policy
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-8 py-3 rounded-xl shadow-lg hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {loading ? "Submitting..." : "Register Student"}
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="fixed bottom-6 left-6 bg-green-500 text-white px-5 py-2 rounded-lg shadow-lg hover:bg-gray-600 transition"
                        >
                            ← Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
);

const Input = ({ label, name, formData, handleChange, error, type = "text" }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${error ? "border-red-500" : "border-gray-300"
                }`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const Select = ({ label, name, options, formData, handleChange, error }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${error ? "border-red-500" : "border-gray-300"
                }`}
        >
            <option value="">Select</option>
            {options.map((opt: string) => (
                <option key={opt}>{opt}</option>
            ))}
        </select>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

const TextArea = ({ label, name, formData, handleChange, error }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${error ? "border-red-500" : "border-gray-300"
                }`}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);

export default StudentRegistration;
