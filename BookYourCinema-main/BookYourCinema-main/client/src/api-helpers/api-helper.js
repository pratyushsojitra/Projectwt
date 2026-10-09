import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('byc-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllMovies = (search = '') => api.get('/movies', { params: search ? { search } : {} });
export const getMovie = (id) => api.get(`/movies/${id}`);
export const getShowtimes = (movieId) => api.get('/showtime', { params: movieId ? { movieId } : {} });
export const getTheaters = () => api.get('/theaters');
export const createReservation = (showtimeId, seats) => api.post('/reservation', { showtimeId, seats });
export const getMyReservations = () => api.get('/reservation/mine');

export const userAuthRequest = async (data, isSignIn) => {
  const response = await api.post(`/user/${isSignIn ? 'signin' : 'signup'}`, {
    ...(isSignIn ? {} : { username: data.name, phone: data.mobile }),
    email: data.email,
    password: data.password
  });
  return response.data;
};

export const adminAuthRequest = async (data, isSignIn) => {
  const response = await api.post(`/admin/${isSignIn ? 'signin' : 'signup'}`, {
    ...(isSignIn ? {} : { adminName: data.name, phone: data.mobile }),
    email: data.email,
    password: data.password
  });
  return response.data;
};

export default api;
