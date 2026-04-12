/**
 * QueryProvider
 *
 * Wraps the app with TanStack Query's QueryClientProvider.
 * Configured to match the SQLite cache TTL (30 minutes stale time).
 */

import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * staleTime: Data is considered fresh for 30 minutes.
       * During this window TanStack Query will NOT re-fetch on mount or focus.
       * This aligns with the SQLite TTL in hotelDao.ts.
       */
      staleTime: 30 * 60 * 1000, // 30 minutes

      /**
       * gcTime: Unused query results are kept in memory for 1 hour
       * before being garbage collected.
       */
      gcTime: 60 * 60 * 1000, // 1 hour

      /**
       * retry: On network error, retry up to 2 times before showing error.
       */
      retry: 2,

      /**
       * refetchOnWindowFocus: Disabled — mobile apps don't have "windows".
       * Re-enable if you want background refresh on app foreground.
       */
      refetchOnWindowFocus: false,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

const QueryProvider: React.FC<QueryProviderProps> = ({children}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;
