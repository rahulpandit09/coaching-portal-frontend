const BASE_URL = "http://localhost:8000/api/courses";

// GET all courses
export const getCourses = async (params?: any) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}?${query}`);
  return res.json();
};

// GET single course
export const getCourse = async (id: number) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  return res.json();
};

// CREATE course
export const createCourse = async (data: any) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// UPDATE course
export const updateCourse = async (id: number, data: any) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// DELETE course
export const deleteCourse = async (id: number) => {
  await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
};

// UPDATE status
export const updateCourseStatus = async (id: number, status: string) => {
  const res = await fetch(`${BASE_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};