const initialState = {
  isAuthenticated: false,
  user: null,
  error: null,
  isInitialized: false
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'SIGNUP_SUCCESS':
      return { 
        ...state, 
        isAuthenticated: true, 
        error: null,
        user: action.payload || state.user, // Keep existing user if no payload
        isInitialized: true 
      };

    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return { 
        ...state, 
        error: action.payload, 
        isAuthenticated: false, 
        user: null,
        isInitialized: true 
      };

    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        error: null, 
        user: null,
        isInitialized: true 
      };

    case 'AUTH_INITIALIZED':
      return { ...state, isInitialized: true };

    default:
      return state;
  }
};

export default authReducer;
