# Sentinel Security Journal

## 2025-10-27 - [Blocking Password Hashing]

**Vulnerability:** Synchronous password hashing was blocking the Node.js event loop in user creation, creating a Denial of Service (DoS) risk.

**Learning:** Even with fast libraries, CPU-intensive crypto operations must be async on the server to maintain availability. Legacy code often hides synchronous crypto calls in helper functions.

**Prevention:** Audit all crypto imports for synchronous usage. Prefer async/await patterns for all security primitives.
