import { configureStore } from "@reduxjs/toolkit";
import { packingApi } from "@/lib/apiSlice";

export const store = configureStore({
  reducer: {
    [packingApi.reducerPath]: packingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(packingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

