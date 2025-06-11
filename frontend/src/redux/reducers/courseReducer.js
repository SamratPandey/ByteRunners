import {
  FETCH_COURSES_REQUEST,
  FETCH_COURSES_SUCCESS,
  FETCH_COURSES_FAILURE,
  FETCH_COURSE_DETAILS_REQUEST,
  FETCH_COURSE_DETAILS_SUCCESS,
  FETCH_COURSE_DETAILS_FAILURE,
  ADD_TO_WISHLIST_REQUEST,
  ADD_TO_WISHLIST_SUCCESS,
  ADD_TO_WISHLIST_FAILURE,
  REMOVE_FROM_WISHLIST_REQUEST,
  REMOVE_FROM_WISHLIST_SUCCESS,
  REMOVE_FROM_WISHLIST_FAILURE,
  PURCHASE_COURSE_REQUEST,
  PURCHASE_COURSE_SUCCESS,
  PURCHASE_COURSE_FAILURE,
  SET_COURSE_FILTERS,
  SET_SEARCH_TERM
} from '../actions/courseActions';

const initialState = {
  courses: [],
  currentCourse: null,
  relatedCourses: [],
  userInfo: null,
  wishlist: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    level: 'all',
    price: 'all',
    rating: null,
    sort: 'newest'
  },
  searchTerm: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNext: false,
    hasPrev: false
  },
  categories: []
};

const courseReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COURSES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_COURSES_SUCCESS:
      return {
        ...state,
        loading: false,
        courses: action.payload.courses,
        pagination: action.payload.pagination,
        categories: action.payload.filters?.categories || state.categories,
        error: null
      };
    
    case FETCH_COURSES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        courses: []
      };
    
    case FETCH_COURSE_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case FETCH_COURSE_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCourse: action.payload.course,
        userInfo: action.payload.userInfo,
        relatedCourses: action.payload.relatedCourses,
        error: null
      };
    
    case FETCH_COURSE_DETAILS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        currentCourse: null
      };
    
    case ADD_TO_WISHLIST_REQUEST:
    case REMOVE_FROM_WISHLIST_REQUEST:
      return {
        ...state,
        loading: true
      };
    
    case ADD_TO_WISHLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: {
          ...state.userInfo,
          isInWishlist: true
        },
        wishlist: [...state.wishlist, action.payload.courseId]
      };
    
    case REMOVE_FROM_WISHLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: {
          ...state.userInfo,
          isInWishlist: false
        },
        wishlist: state.wishlist.filter(id => id !== action.payload.courseId)
      };
    
    case ADD_TO_WISHLIST_FAILURE:
    case REMOVE_FROM_WISHLIST_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case PURCHASE_COURSE_REQUEST:
      return {
        ...state,
        loading: true
      };
    
    case PURCHASE_COURSE_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: {
          ...state.userInfo,
          isPurchased: true,
          isEnrolled: true
        }
      };
    
    case PURCHASE_COURSE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case SET_COURSE_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
    
    case SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload
      };
    
    default:
      return state;
  }
};

export default courseReducer;
