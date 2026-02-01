'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/use-auth';
import { WorkspaceProvider } from '@/hooks/use-workspace';
import { ToastProvider } from '@/components/ui/toast';

// ===========================================
// PIXLY - App Providers
// Optimized for performance & stability
// ===========================================

// Factory function for creating QueryClient with optimized defaults
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2, // 2 minutes - balanced freshness vs performance
        gcTime: 1000 * 60 * 10, // 10 minutes cache retention
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

// Singleton for server-side rendering
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Use useState to ensure QueryClient is stable across renders
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
