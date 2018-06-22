import { createStore, applyMiddleware } from 'redux';
import ReduxPromise from 'redux-promise';

import { combineReducers } from 'redux';
// import friends from './friends';
import comments from './comments'
import notification from './notification';

// friends: friends,
const reducers = combineReducers({
    comments: comments,
    notifications: notification
});

const createStoreWithMiddleware = applyMiddleware(ReduxPromise)(createStore);
const store = createStoreWithMiddleware(reducers);

export default store;
