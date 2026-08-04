/**
 * Frontend Fetch API Client
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: data?.error || data?.message || `HTTP Error ${response.status}`,
        status: response.status,
      };
    }

    return {
      data: data as T,
      status: response.status,
    };
  } catch (error) {
    console.error(`[API Client Error] Request failed for ${endpoint}:`, error);
    return {
      error: error instanceof Error ? error.message : "Network error occurred",
      status: 500,
    };
  }
}
