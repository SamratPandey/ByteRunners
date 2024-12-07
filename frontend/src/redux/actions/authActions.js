import axios from 'axios';
export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
    dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.token });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
  }
};

export const signup = (name, email, password) => async (dispatch) => {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/register', { name, email, password });
    dispatch({ type: 'SIGNUP_SUCCESS', payload: response.data.token });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    dispatch({ type: 'SIGNUP_FAILURE', payload: errorMessage });
  }
};


// Action to handle logout
export const logout = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch({ type: 'LOGOUT' });
};