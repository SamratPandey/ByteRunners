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
    // Add header to identify this as an auth check
    const response = await authApi.get('/api/auth/check-auth', {
      headers: {
        'x-checking-auth': 'true'
      }
    });
    
    if (response.data.success) {
      // Store user data from successful auth check
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
    dispatch({ type: 'LOGOUT' });
    return false;
  } finally {
    // Mark auth as initialized regardless of outcome
    dispatch({ type: 'AUTH_INITIALIZED' });
  }
};

// Action to handle logout
export const logout = () => async (dispatch) => {
  try {
    await authApi.post('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear any stored auth data
  localStorage.removeItem('auth');
  sessionStorage.removeItem('auth');
  
  // Always dispatch the logout action
  dispatch({ type: 'LOGOUT' });
};