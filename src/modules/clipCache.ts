import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export const CLIP_MODEL = "Xenova/clip-vit-base-patch32";
export type TextVectors = Record<string, number[]>;
// Model and exact English text determine a vector, not the card id or page.
export const clipCacheKey = (text: string) => JSON.stringify([CLIP_MODEL, text]);
const slice = createSlice({
  name: "clip",
  initialState: { textVectors: {} as TextVectors },
  reducers: {
    cacheTextVectors(state, action: PayloadAction<TextVectors>) {
      Object.assign(state.textVectors, action.payload);
    },
  },
});
export const { cacheTextVectors } = slice.actions;
export const clipReducer = slice.reducer;
