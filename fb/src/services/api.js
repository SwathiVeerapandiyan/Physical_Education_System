import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data || 'An unexpected error occurred';
    return Promise.reject({
      message,
      status: error.response?.status,
      originalError: error,
    });
  }
);

export const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data; // LoginResponse: { success, message, userDetails }
  },
  
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data; // User model
  },

  getAllUsers: async () => {
    const response = await apiClient.get('/auth/users');
    return response.data; // List<User>
  }
};

export const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data; // DashboardStatsDto: { totalUsers, totalCandidates, totalMaleStudents, totalFemaleStudents }
  }
};

export const userFormService = {
  getAll: async () => {
    const response = await apiClient.get('/users-form');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await apiClient.get(`/users-form/${id}`);
    return response.data;
  },
  
  create: async (formData) => {
    const response = await apiClient.post('/users-form', formData);
    return response.data;
  },
  
  update: async (id, formData) => {
    const response = await apiClient.put(`/users-form/${id}`, formData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/users-form/${id}`);
    return response.data;
  }
};

export const familyDetailsService = {
  getByCandidateId: async (candidateId) => {
    const response = await apiClient.get(`/family-details/candidate/${candidateId}`);
    return response.data;
  },
  
  create: async (familyData) => {
    const response = await apiClient.post('/family-details', familyData);
    return response.data;
  },
  
  update: async (id, familyData) => {
    const response = await apiClient.put(`/family-details/${id}`, familyData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/family-details/${id}`);
    return response.data;
  }
};

export const documentDetailsService = {
  getByCandidateId: async (candidateId) => {
    const response = await apiClient.get(`/document-details/candidate/${candidateId}`);
    return response.data;
  },
  
  create: async (documentData) => {
    const response = await apiClient.post('/document-details', documentData);
    return response.data;
  },
  
  update: async (id, documentData) => {
    const response = await apiClient.put(`/document-details/${id}`, documentData);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await apiClient.delete(`/document-details/${id}`);
    return response.data;
  }
};

export const sportsService = {
  getAll: async () => (await apiClient.get('/sports')).data,
  getById: async (id) => (await apiClient.get(`/sports/${id}`)).data,
  create: async (data) => (await apiClient.post('/sports', data)).data,
  update: async (id, data) => (await apiClient.put(`/sports/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/sports/${id}`)).data,
};

export const tournamentService = {
  getAll: async (status) => (await apiClient.get('/tournaments', { params: { status } })).data,
  getById: async (id) => (await apiClient.get(`/tournaments/${id}`)).data,
  create: async (data) => (await apiClient.post('/tournaments', data)).data,
  update: async (id, data) => (await apiClient.put(`/tournaments/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/tournaments/${id}`)).data,
};

export const teamService = {
  getAll: async (sportId) => (await apiClient.get('/teams', { params: { sportId } })).data,
  getById: async (id) => (await apiClient.get(`/teams/${id}`)).data,
  create: async (data) => (await apiClient.post('/teams', data)).data,
  update: async (id, data) => (await apiClient.put(`/teams/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/teams/${id}`)).data,
};

export const teamMemberService = {
  getByTeamId: async (teamId) => (await apiClient.get(`/team-members/team/${teamId}`)).data,
  getByStudentId: async (studentId) => (await apiClient.get(`/team-members/student/${studentId}`)).data,
  create: async (data) => (await apiClient.post('/team-members', data)).data,
  delete: async (id) => (await apiClient.delete(`/team-members/${id}`)).data,
};

export const tournamentRegistrationService = {
  getByTournamentId: async (tId) => (await apiClient.get(`/tournament-registrations/tournament/${tId}`)).data,
  getByTeamId: async (teamId) => (await apiClient.get(`/tournament-registrations/team/${teamId}`)).data,
  create: async (data) => (await apiClient.post('/tournament-registrations', data)).data,
  update: async (id, data) => (await apiClient.put(`/tournament-registrations/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/tournament-registrations/${id}`)).data,
};

export const matchService = {
  getAll: async (tournamentId) => (await apiClient.get('/matches', { params: { tournamentId } })).data,
  getById: async (id) => (await apiClient.get(`/matches/${id}`)).data,
  create: async (data) => (await apiClient.post('/matches', data)).data,
  update: async (id, data) => (await apiClient.put(`/matches/${id}`, data)).data,
  delete: async (id) => (await apiClient.delete(`/matches/${id}`)).data,
};

export default apiClient;
