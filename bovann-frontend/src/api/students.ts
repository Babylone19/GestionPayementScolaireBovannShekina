import axios from 'axios';
import { CreateStudentDto, Student } from '../types/student';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'http://backend:3000/api/auth'
  : 'http://localhost:3000/api/auth';
interface ApiResponse {
  success: boolean;
  students?: Student[];
  student?: Student;
}

export const createStudent = async (token: string, student: CreateStudentDto): Promise<Student> => {
  const response = await axios.post(API_URL, student, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.data.success && response.data.student) {
    return response.data.student;
  } else {
    throw new Error('Failed to create student');
  }
};

export const getStudents = async (token: string): Promise<Student[]> => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data: ApiResponse = response.data;
  if (data.success && data.students) {
    return data.students;
  } else {
    console.error('Les données des étudiants ne sont pas un tableau:', data);
    return [];
  }
};
