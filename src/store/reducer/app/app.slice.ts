import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IAppState {
    test: string;
}

const initialState: IAppState = {
    test: 'test',
};

export const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        add: (state, action: PayloadAction<{ text: string }>) => {
            const { text } = action.payload;
            state.test = text;
        },
    },
});

export default appSlice;
