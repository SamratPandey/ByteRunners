import axios from 'axios';

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, { email, password });

    if (response.data.token) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.token });
    } else {
      dispatch({ type: 'LOGIN_FAILURE', payload: response.data.message || 'Login failed' });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
  }
};


export const signup = (name, email, password) => async (dispatch) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, { name, email, password });

    if (response.data.token) {
      dispatch({ type: 'SIGNUP_SUCCESS', payload: response.data.token });
    } else {
      dispatch({ type: 'SIGNUP_FAILURE', payload: response.data.message || 'Signup failed' });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch({ type: 'SIGNUP_FAILURE', payload: errorMessage });
  }
};



// Action to handle logout
export const logout = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch({ type: 'LOGOUT' });
};