import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { api } from "@/lib/api";
import type {
  Client,
  UserPreferences,
  JobOrder,
  Invoice,
} from "@/lib/types";

export const packingApi = createApi({
  reducerPath: "packingApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["JobOrders", "Invoices", "Clients", "UserPreferences"],
  endpoints: (builder) => ({
    getJobOrders: builder.query<JobOrder[], void>({
      async queryFn() {
        try {
          const data = await api.getJobOrders();
          return { data };
        } catch (error) {
          return { error: error as unknown as Error };
        }
      },
      providesTags: ["JobOrders"],
    }),
    getInvoices: builder.query<Invoice[], void>({
      async queryFn() {
        try {
          const data = await api.getInvoices();
          return { data };
        } catch (error) {
          return { error: error as unknown as Error };
        }
      },
      providesTags: ["Invoices"],
    }),
    getClients: builder.query<Client[], void>({
      async queryFn() {
        try {
          const data = await api.getClients();
          return { data };
        } catch (error) {
          return { error: error as unknown as Error };
        }
      },
      providesTags: ["Clients"],
    }),
    getUserPreferences: builder.query<UserPreferences[], number>({
      async queryFn(clientId) {
        try {
          const data = await api.getUserPreferences(clientId);
          return { data };
        } catch (error) {
          return { error: error as unknown as Error };
        }
      },
      providesTags: (_r, _e, clientId) => [
        { type: "UserPreferences", id: clientId },
      ],
    }),
  }),
});

export const {
  useGetJobOrdersQuery,
  useGetInvoicesQuery,
  useGetClientsQuery,
  useGetUserPreferencesQuery,
} = packingApi;

