// import {createStore, combineReducers} from 'redux';
import { configureStore } from "@reduxjs/toolkit";
import app from './app';

const store = configureStore({
  //子store
  reducer: {
    app,
  },
  middleware: (getDefaultMiddleware) => //解决Warning A non-serializable value was detected in an action
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

export type StateType = ReturnType<typeof store.getState>
export type DispatchType = typeof store.dispatch