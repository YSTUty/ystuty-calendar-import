import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

import appSlice from './reducer/app/app.slice';

export const reducer = combineReducers({
    app: appSlice.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export default configureStore({ reducer });
