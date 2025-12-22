import { ChatSDKError, type ErrorCode } from './errors';

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let code: ErrorCode | undefined;
    let cause: string | undefined;

    try {
      const json = await response.json();
      code = json.code;
      cause = json.cause;
    } catch {
      // Failed to parse JSON error response
      cause = response.statusText;
    }

    // If we have a code, reuse it. Otherwise default to api error.
    // If the server didn't send a code, we might need to map status code to ErrorCode manually
    // but ChatSDKError constructor expects an ErrorCode string.
    throw new ChatSDKError(code ?? 'bad_request:api', cause);
  }

  if (response.status === 204) {
    return {} as T;
  }

  try {
    return await response.json();
  } catch {
    // If JSON parsing fails for a successful response (e.g. text), return null or empty object
    // Or maybe we should handle text responses? For now assume JSON API.
    return {} as T;
  }
}

function buildUrl(url: string, params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

export const api = {
  get: async <T>(url: string, options?: FetchOptions): Promise<T> => {
    const finalUrl = buildUrl(url, options?.params);
    const response = await fetch(finalUrl, {
      ...options,
      method: 'GET',
    });
    return handleResponse<T>(response);
  },

  post: async <T>(url: string, body?: unknown, options?: FetchOptions): Promise<T> => {
    const finalUrl = buildUrl(url, options?.params);
    const response = await fetch(finalUrl, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(url: string, body?: unknown, options?: FetchOptions): Promise<T> => {
    const finalUrl = buildUrl(url, options?.params);
    const response = await fetch(finalUrl, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(url: string, body?: unknown, options?: FetchOptions): Promise<T> => {
    const finalUrl = buildUrl(url, options?.params);
    const response = await fetch(finalUrl, {
      ...options,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(url: string, options?: FetchOptions): Promise<T> => {
    const finalUrl = buildUrl(url, options?.params);
    const response = await fetch(finalUrl, {
      ...options,
      method: 'DELETE',
    });
    return handleResponse<T>(response);
  },
};
