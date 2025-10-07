import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";

// Custom error class that includes HTTP status
class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const responseText = await res.text();
      console.log(`🔍 Response body for ${res.status}:`, responseText.substring(0, 200));
      
      if (responseText) {
        // Try to parse as JSON to get the error message
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || responseText;
        } catch (jsonError) {
          // If not JSON, check if it's HTML (likely login redirect)
          if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
            if (res.status === 401 || res.status === 403) {
              errorMessage = 'Session expired. Please log in again.';
            } else {
              errorMessage = 'Server returned unexpected HTML response';
            }
          } else {
            errorMessage = responseText;
          }
        }
      }
    } catch {
      // If we can't read the response, use status text
    }
    
    console.error(`❌ API Error ${res.status}:`, errorMessage);
    throw new ApiError(errorMessage, res.status);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  console.log(`🌐 API Request: ${method} ${url}`, data ? data : 'no data');
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  console.log(`📡 API Response: ${res.status} ${res.statusText}`);
  
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Shared auth error handler
function handleAuthError(error: Error) {
  // Check if this is an ApiError with HTTP status
  const isAuthError = (error instanceof ApiError && (error.status === 401 || error.status === 403)) ||
                      error.message.toLowerCase().includes('invalid token') || 
                      error.message.toLowerCase().includes('access token required') ||
                      error.message.toLowerCase().includes('session expired') ||
                      error.message.toLowerCase().includes('jwt malformed') ||
                      error.message.toLowerCase().includes('unauthorized');
  
  if (isAuthError) {
    console.error('🔒 Auth error detected, clearing session:', error.message);
    setTimeout(() => {
      localStorage.clear();
      window.location.href = '/';
    }, 500);
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleAuthError,
  }),
  mutationCache: new MutationCache({
    onError: handleAuthError,
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
