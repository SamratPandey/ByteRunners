const initialState = {
  token: localStorage.getItem('token') || null,  // Get token from localStorage (if available)
  error: null,  // Store error message from failed login or signup attempts
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload);  // Save JWT token to localStorage
      return { ...state, token: action.payload, error: null };  // Store token in state

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { ...state, error: action.payload };  // Store error message in state

    case 'LOGOUT':  // Optional action for logout
      localStorage.removeItem('token');  // Remove token from localStorage
      return { ...state, token: null, error: null };  // Reset token and error in state

    default:
      return state;  // Return the state if no relevant action is found
  }
};

export default authReducer;
