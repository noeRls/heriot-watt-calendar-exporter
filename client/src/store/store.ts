import { combineReducers, createStore, applyMiddleware } from "@reduxjs/toolkit";
import { appSlice, AppSliceState } from './reducer';
import thunk from 'redux-thunk';

export interface RootState {
    app: AppSliceState;
}

const rootReducer = combineReducers({
    app: appSlice.reducer,
});

export const store = createStore(rootReducer, applyMiddleware(thunk));
