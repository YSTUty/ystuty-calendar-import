import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { EqualityFn, useSelector as useSelectorBase } from 'react-redux';

import appSlice from './reducer/app/app.slice';
import scheduleSlice from './reducer/schedule/schedule.slice';

export const reducer = combineReducers({
    app: appSlice.reducer,
    schedule: scheduleSlice.reducer,
});

export type RootState = ReturnType<typeof reducer>;

export const useSelector: <TState = RootState, Selected = unknown>(
    selector: (state: TState) => Selected,
    equalityFn?: EqualityFn<Selected> | undefined,
) => Selected = useSelectorBase;

export default configureStore({ reducer });
