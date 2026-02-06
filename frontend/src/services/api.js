import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || 'Something went wrong. Please try again.';
    return Promise.reject(message);
  }
);

export const fetchEmployees = async () => {
  const { data } = await api.get('/api/employees');
  return data;
};

export const createEmployee = async (employeeData) => {
  const { data } = await api.post('/api/employees', employeeData);
  return data;
};

export const deleteEmployee = async (employeeId) => {
  const { data } = await api.delete(`/api/employees/${employeeId}`);
  return data;
};

export const fetchAttendance = async (employeeId, params = {}) => {
  const { data } = await api.get(`/api/attendance/${employeeId}`, { params });
  return data;
};

export const fetchAttendanceSummary = async (employeeId) => {
  const { data } = await api.get(`/api/attendance/${employeeId}/summary`);
  return data;
};

export const markAttendance = async (attendanceData) => {
  const { data } = await api.post('/api/attendance', attendanceData);
  return data;
};

export const fetchDashboard = async () => {
  const { data } = await api.get('/api/dashboard');
  return data;
};
