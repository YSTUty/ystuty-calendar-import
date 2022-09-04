import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import store2 from 'store2';

export const STORE_GROUP_NAME_KEY = 'lastGroupName';
export const STORE_TEACHER_NAME_KEY = 'lastTeacherName';
export const STORE_ALLOW_MULTIPLE_GROUP_KEY = 'allowMultipleGroup';
export const STORE_ALLOW_MULTIPLE_TEACHERS_KEY = 'allowMultipleTeachers';

export const getLastGroups = () => store2.get(STORE_GROUP_NAME_KEY, []) as string[];
export const getLastTeachers = () => store2.get(STORE_TEACHER_NAME_KEY, []) as number[];
export const DEFAULT_ALLOW_MULTIPLE_GROUP: boolean = !!store2.get(STORE_ALLOW_MULTIPLE_GROUP_KEY, false);
export const DEFAULT_ALLOW_MULTIPLE_TEACHERS: boolean = !!store2.get(STORE_ALLOW_MULTIPLE_TEACHERS_KEY, false);

const initialState = {
    selectedGroups: getLastGroups(),
    selectedTeachers: getLastTeachers(),
    allowedMultipleGroups: DEFAULT_ALLOW_MULTIPLE_GROUP,
    allowedMultipleTeachers: DEFAULT_ALLOW_MULTIPLE_TEACHERS,
};

export const scheduleSlice = createSlice({
    name: 'schedule',
    initialState,
    reducers: {
        setSelectedGroups: (state, action: PayloadAction<string[]>) => {
            state.selectedGroups = action.payload;
        },
        setSelectedTeachers: (state, action: PayloadAction<number[]>) => {
            state.selectedTeachers = action.payload;
        },
        setAllowedMultipleGroup: (state, action: PayloadAction<boolean>) => {
            store2.set(STORE_ALLOW_MULTIPLE_GROUP_KEY, action.payload);
            state.allowedMultipleGroups = action.payload;
        },
        setAllowedMultipleTeachers: (state, action: PayloadAction<boolean>) => {
            store2.set(STORE_ALLOW_MULTIPLE_TEACHERS_KEY, action.payload);
            state.allowedMultipleTeachers = action.payload;
        },
    },
});

export default scheduleSlice;
