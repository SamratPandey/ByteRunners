const initialState = {
  token: localStorage.getItem('adminToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  error: null,
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADMIN_LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
        error: null,
      };

    case 'ADMIN_LOGIN_FAIL':
      return {
        ...state,
        error: action.payload,
        isAuthenticated: false,
      };

    case 'ADMIN_LOGOUT':
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        error: null,
      };

    default:
      return state;
  }
};

export default adminReducer;
