import { configureStore } from "@reduxjs/toolkit";
import auth from "@/features/auth/auth.slice";
import api from "@/store/api";

export const store = configureStore({
  reducer: {
    auth,
    [api.reducerPath]: api.reducer
  },
  middleware: (gDM) => gDM().concat(api.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
