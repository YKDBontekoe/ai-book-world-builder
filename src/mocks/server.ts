import { setupServer, type SetupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW Node.js mock server instance for unit/integration tests.
 * Use `.listen()`, `.resetHandlers()`, and `.close()` in test setup/teardown.
 */
export const server: SetupServer = setupServer(...handlers)
