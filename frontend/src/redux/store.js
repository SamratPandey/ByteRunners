import { createStore, combineReducers, applyMiddleware } from 'redux';  // Import applyMiddleware
import {thunk} from 'redux-thunk';  // Correct import for thunk middleware
import { Provider } from 'react-redux';
import authReducer from './reducers/authReducer';  // Import your auth reducer

// Combine reducers if you have multiple slices of state
const rootReducer = combineReducers({
  auth: authReducer,
});

// Create the Redux store and apply Redux Thunk middleware
const store = createStore(
  rootReducer,   // Pass the rootReducer to create the store
  applyMiddleware(thunk)  // Apply Redux Thunk middleware to handle async actions
);

export default store;
