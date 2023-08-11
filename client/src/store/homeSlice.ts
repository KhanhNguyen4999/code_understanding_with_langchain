// libs
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
// store
import { RootState } from './store';

export interface HomeState {
  loading: boolean;
  listResponse: [];
}

const initialState: HomeState = {
  loading: false,
  listResponse: [],
};

export const addResponses: any = createAsyncThunk('common/getAll', async (payload: any) => {
  console.log(payload);
  return payload;
});

const HomeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(addResponses.pending, (state) => {
        state.loading = true;
      })
      .addCase(addResponses.fulfilled, (state, action) => {
        state.loading = false;
        state.listResponse = action.payload;
      })
  },
});

const {  reducer } = HomeSlice;

export default reducer;

//Selector to access SellDevice state.
export const homeState = (state: RootState) => state.home;
