const initialState = {
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'), // Set based on token
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload);
      return { ...state, token: action.payload, isAuthenticated: true, error: null };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { ...state, error: action.payload, isAuthenticated: false };

    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...state, token: null, isAuthenticated: false, error: null };

    default:
      return state;
  }
};

export default authReducer;
