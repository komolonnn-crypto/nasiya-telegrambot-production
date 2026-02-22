import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface INote {
  _id: string;
  text: string;
  fullName: string;
  createBy: string;
  createdAt: string;
}

export interface UserState {
  notes: INote[] | [];
  isLoading: boolean;
}

const initialState: UserState = {
  notes: [],
  isLoading: false,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setNotes(state, action: PayloadAction<INote[] | []>) {
      state.isLoading = false;
      state.notes = action.payload;
    },
    start(state) {
      state.isLoading = true;
    },
    success(state) {
      state.isLoading = false;
    },
    failure(state) {
      state.isLoading = false;
    },
  },
});

export const { setNotes, start, success, failure } = notesSlice.actions;
export default notesSlice.reducer;
