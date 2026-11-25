import { clipReducer } from "./clipCache";
import {
  configureStore,
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { getBatteryTypePage } from "./batteryApi";
export const loadBatteryTypePage = createAsyncThunk(
  "battery_type/loadPage",
  ({ min, page }: { min: number; page: number }) =>
    getBatteryTypePage(min, page),
);
import { useDispatch, useSelector } from "react-redux";
const slice = createSlice({
  name: "battery_type",
  initialState: {
    minCapacity: 0,
    page: 1,
    user: null as null | { id: number; username: string },
  },
  reducers: {
    setCapacity(s, a) {
      s.minCapacity = a.payload;
      s.page = 1;
    },
    setPage(s, a) {
      s.page = a.payload;
    },
    setUser(s, a) {
      s.user = a.payload;
    },
  },
});
export const { setCapacity, setPage, setUser } = slice.actions;
export const store = configureStore({
  reducer: { battery_type: slice.reducer, clip: clipReducer },
});
export type RootState = ReturnType<typeof store.getState>;
export const useBatteryType = () =>
  useSelector((s: RootState) => s.battery_type);
export const useBatteryDispatch = () => useDispatch<typeof store.dispatch>();
