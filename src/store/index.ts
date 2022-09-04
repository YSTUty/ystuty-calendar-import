import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

import appSlice from './reducer/app/app.slice';
import scheduleSlice from './reducer/schedule/schedule.slice';

export const reducer = combineReducers({
    app: appSlice.reducer,
    schedule: scheduleSlice.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export default configureStore({ reducer });
