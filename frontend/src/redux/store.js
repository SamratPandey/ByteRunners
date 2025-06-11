import { createStore, combineReducers, applyMiddleware } from 'redux'; 
import {thunk} from 'redux-thunk';  
import { Provider } from 'react-redux';

// Import the reducers
import authReducer from './reducers/authReducer';  
import adminReducer from './reducers/adminReducer';
import courseReducer from './reducers/courseReducer';

// Combine the reducers
const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  courses: courseReducer,
});

const store = createStore(
  rootReducer,   
  applyMiddleware(thunk)  
);

export default store;
