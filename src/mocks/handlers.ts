import { http, HttpResponse } from 'msw'

export const handlers = [
  // Example handler
  http.get('https://api.example.com/user', () => {
    return HttpResponse.json({ name: 'John Maverick' })
  }),
]
