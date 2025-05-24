import authApi from '../../utils/authApi';

export const login = (email, password) => async (dispatch) => {
  try {
    const response = await authApi.post(
      '/api/auth/login',
      { email, password }
    );

    if (response.data.success) {
      dispatch({ type: 'LOGIN_SUCCESS' });
      return true;
    } else {
      dispatch({ type: 'LOGIN_FAILURE', payload: response.data.message || 'Login failed' });
      return false;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    return false;
  }
};


export const signup = (name, email, password) => async (dispatch) => {
  try {
    const response = await authApi.post(
      '/api/auth/register',
      { name, email, password }
    );

    if (response.data.success) {
      dispatch({ type: 'SIGNUP_SUCCESS' });
      return true;
    } else {
      dispatch({ type: 'SIGNUP_FAILURE', payload: response.data.message || 'Signup failed' });
      return false;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'An error occurred';
    dispatch({ type: 'SIGNUP_FAILURE', payload: errorMessage });
    return false;
  }
};

// Action to check authentication status
export const checkAuthStatus = () => async (dispatch) => {
  try {
    // This will now be handled by the request interceptor
    const response = await authApi.get('/api/auth/check-auth');
    
    if (response.data.success) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data.user
      });
      return true;
    } else {
      dispatch({ type: 'LOGOUT' });
      return false;
    }
  } catch (error) {
    console.log('Auth check failed:', error.message);
    dispatch({ type: 'LOGOUT' });
    // Don't show error toast for auth check failures
    return false;
  }
};

// Action to handle logout
export const logout = () => async (dispatch) => {
  try {
    // Call logout endpoint to clear the cookie
    await authApi.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Always dispatch the logout action
  dispatch({ type: 'LOGOUT' });
};