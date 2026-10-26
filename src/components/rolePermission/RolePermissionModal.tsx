import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
import { MODULES, type UserRow } from "@/utils/types";

interface RolePermissionModalProps {
    isOpen: boolean;
    user: UserRow | null;
    modules?: string[];
    onClose: () => void;
    onSave: (updatedUser: UserRow) => void;
}

export default function RolePermissionModal({
    isOpen,
    user,
    modules = MODULES,
    onClose,
    onSave,
}: RolePermissionModalProps) {
    const [editingUser, setEditingUser] = useState<UserRow | null>(user);

    useEffect(() => {
        setEditingUser(user ? { ...user, permissions: { ...user.permissions } } : null);
    }, [user]);

    if (!isOpen || !editingUser) return null;

    const handlePermissionChange = (module: string, value: string) => {
        setEditingUser((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [module]: value,
                },
            };
        });
    };

    const handleSave = () => {
        if (editingUser) {
            onSave(editingUser);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-access-title"
                className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div>
                        <h2
                            id="edit-access-title"
                            className="font-semibold text-slate-800"
                        >
                            Edit User Access
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            {editingUser.fullName} · {editingUser.role}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        aria-label="Close dialog"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Module Permissions List */}
                <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
                    {modules.map((module) => (
                        <div key={module}>
                            <label
                                htmlFor={`permission-${editingUser.id}-${module}`}
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                {module}
                            </label>

                            <select
                                id={`permission-${editingUser.id}-${module}`}
                                value={editingUser.permissions[module] || "-"}
                                onChange={(event) =>
                                    handlePermissionChange(module, event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"
                            >
                                <option value="-">No Access</option>
                                <option value="View">View</option>
                                <option value="Create / Edit">Create / Edit</option>
                                <option value="Manage">Manage</option>
                            </select>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                        <Save className="h-4 w-4" />
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
