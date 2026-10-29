// Pure helper functions to read the logged-in user's identity from localStorage.
// Extracted verbatim from useDmsWorkspace.ts – no behavioural changes.

export const getLoggedInUserId = (): number | null => {
  try {
    const raw =
      typeof window !== "undefined"
        ? localStorage.getItem("userData")
        : null;

    if (!raw) {
      console.error("userData not found in localStorage.");
      return null;
    }

    const parsed = JSON.parse(raw);
    const uid = parsed?.userId ?? parsed?.user_id ?? parsed?.id;

    if (uid === null || uid === undefined || uid === "") {
      console.error("User ID is missing from userData.");
      return null;
    }

    const userId = Number(uid);

    if (!Number.isInteger(userId) || userId <= 0) {
      console.error("Invalid user ID:", uid);
      return null;
    }

    return userId;
  } catch (error) {
    console.error("Failed to read logged-in user ID:", error);
    return null;
  }
};

export const getLoggedInUserName = (): string => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const name = (parsed?.firstName && parsed?.lastName) 
        ? `${parsed.firstName} ${parsed.lastName}` 
        : (parsed?.username ?? parsed?.user_name ?? parsed?.name);
      if (name) return String(name);
    }
  } catch (e) {}
  return "Admin_1";
};

export const getLoggedInUserDesignation = (): string => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const designation = parsed?.designation ?? parsed?.role ?? parsed?.job_title;
      if (designation) return String(designation);
    }
  } catch (e) {}
  return "Software Developer";
};

export const getLoggedInUserDepartment = (): string => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const dept = parsed?.department ?? parsed?.dept ?? parsed?.stationName;
      if (dept) return String(dept);
    }
  } catch (e) {}
  return "IT";
};
