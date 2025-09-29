import api from "./api";

export const getStudents = async () => {
  try {
    const response = await api.get("/students");
    return response.data;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};
