import { http, HttpResponse, type HttpHandler } from 'msw'

/**
 * Standard MSW handlers for the application.
 * Array of HTTP handlers for use in the mock server.
 */
export const handlers: HttpHandler[] = [
  // Example handler
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({ name: 'John Maverick' })
  }),
]
