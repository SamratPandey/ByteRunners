const initialState = {
  isAuthenticated: false, // No longer checking localStorage, will be set by login action
  error: null,
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADMIN_LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        error: null,
      };

    case 'ADMIN_LOGIN_FAIL':
      return {
        ...state,
        error: action.payload,
        isAuthenticated: false,
      };    case 'ADMIN_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        error: null,
      };

    default:
      return state;
  }
};

export default adminReducer;
