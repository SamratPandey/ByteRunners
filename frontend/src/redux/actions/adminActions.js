import axios from 'axios';

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, { email, password });
    
    // Store the token in localStorage
    localStorage.setItem('adminToken', response.data.token);
    
    // Dispatch the success action
    dispatch({
      type: 'ADMIN_LOGIN_SUCCESS',
      payload: response.data.token, // Storing only the token
    });
  } catch (error) {
    console.error('Login error:', error); // Log the full error object
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    dispatch({
      type: 'ADMIN_LOGIN_FAIL',
      payload: errorMessage,
    });
    throw new Error(errorMessage);
  }
  
};

export const logout = () => (dispatch) => {
  localStorage.removeItem('adminToken'); 
  dispatch({ type: 'ADMIN_LOGOUT' });
};
