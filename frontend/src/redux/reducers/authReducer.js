const initialState = {
  isAuthenticated: false, // Will be set by checking auth status
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return { ...state, isAuthenticated: true, error: null };

    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return { ...state, error: action.payload, isAuthenticated: false };

    case 'LOGOUT':
      return { ...state, isAuthenticated: false, error: null };

    default:
      return state;
  }
};

export default authReducer;
