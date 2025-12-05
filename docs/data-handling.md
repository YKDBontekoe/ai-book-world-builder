# Data handling and safety

This guide explains how to keep secrets, personally identifiable information (PII), and AI-generated content safe across local development and deployments.

## Secrets and environment variables
- Store secrets in environment variables instead of source files. Copy `.env.example` to `.env.local` for local development and keep it out of version control.
- Avoid exposing secrets to client-side code. Only variables prefixed with `NEXT_PUBLIC_` are bundled for the browser; keep all credentials server-only and reference them in Server Components, Route Handlers, or server actions.
- Use your hosting platform's secret manager (for example, Vercel Environment Variables) for production. Rotate keys regularly and prune unused credentials.
- Validate that every required secret is set at boot (for example, through startup checks) and fail fast with clear errors when values are missing.

## Handling PII and sensitive data
- Collect only the minimum PII required for the feature and document why it is needed.
- Prefer server-side processing and storage so that PII never leaves trusted environments. Avoid persisting PII inside client-side state or local storage.
- Redact or hash sensitive identifiers (emails, IP addresses, access tokens) before persisting or emitting them to analytics, logs, or monitoring systems.
- Support deletion and export by keeping PII scoped and discoverable (for example, through a single data access layer or table).

## Generated content governance
- Label AI-generated content when shown to users and avoid presenting it as factual without verification.
- Apply output filters (moderation, allowlists, or pattern checks) before persisting or displaying model responses. Block or flag content that violates acceptable-use policies.
- Keep prompts, system instructions, and training snippets free of PII and secrets. Use template variables rather than hard-coding sensitive strings.

## Rate limiting
- Apply rate limits per authenticated user and IP to protect upstream model providers and database resources. Prefer short burst limits with sensible sustained ceilings.
- Enforce limits in middleware or server handlers before expensive work (model calls, database writes, file uploads). Return clear 429 responses with retry guidance.
- Use shared state (for example, Redis, KV, or the deployment platform's edge store) so limits are consistent across replicas.

## Logging and monitoring
- Log at the minimum level needed for debugging. Avoid logging raw prompts, full model responses, secrets, or PII. If logging is required, redact sensitive fields before emit.
- Set retention periods and access controls for observability tooling. Delete logs that contain sensitive data as part of incident response.
- Capture structured metadata (request ids, user ids, feature flags) to trace issues without exposing personal content.

## Model prompt safety
- Validate and normalize user inputs (length, encoding, content-type) before sending them to models.
- Constrain model tools and actions to a minimal, auditable set. Reject tool calls that are not explicitly allowed.
- Include safety rails in system prompts (context boundaries, refusal policies, and escalation paths). Avoid unbounded instructions or dynamic template injection.
- Monitor model responses for safety categories (e.g., self-harm, violence, personal data) and block or escalate when detected.
