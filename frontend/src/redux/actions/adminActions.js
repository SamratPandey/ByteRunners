import adminApi from '../../utils/adminApi';

export const login = (email, password) => async (dispatch) => {
  try {
    // Use adminApi which already has withCredentials set
    const response = await adminApi.post(
      '/api/admin/login', 
      { email, password }
    );
    
    // Dispatch the success action
    dispatch({
      type: 'ADMIN_LOGIN_SUCCESS',
      payload: true, // We just store the auth state
    });
    return true;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    dispatch({
      type: 'ADMIN_LOGIN_FAIL',
      payload: errorMessage,
    });
    return false;
  }
};

export const logout = () => async (dispatch) => {
  try {
    // Call the logout endpoint to clear the cookie on the server
    await adminApi.post('/api/admin/logout');
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Always dispatch logout action regardless of server response
  dispatch({ type: 'ADMIN_LOGOUT' });
};

// Action to check admin authentication status
export const checkAdminAuthStatus = () => async (dispatch) => {
  try {
    // Add a header to identify this as an auth check request
    const response = await adminApi.get('/api/admin/check-auth', {
      headers: {
        'x-checking-auth': 'true'
      }
    });
    
    if (response.data.success) {
      dispatch({
        type: 'ADMIN_LOGIN_SUCCESS',
        payload: response.data.admin
      });
      return true;
    } else {
      dispatch({ type: 'ADMIN_LOGOUT' });
      return false;
    }
  } catch (error) {
    dispatch({ type: 'ADMIN_LOGOUT' });
    // Don't show error toast for auth check failures
    return false;
  }
};
