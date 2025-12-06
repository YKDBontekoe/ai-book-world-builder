---
description: Set up development environment
---

# Development Environment Setup

Follow these steps to set up your local development environment for the AI Book World Builder project.

## Prerequisites

Ensure you have the following installed:
- Node.js 18+ (preferably via nvm)
- pnpm (recommended) or npm
- PostgreSQL (or access to a Postgres database)
- Git

## Setup Steps

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd /path/to/ai-book-world-builder

# Install dependencies
pnpm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and fill in required values:
# - DATABASE_URL (Postgres connection string)
# - AI_GATEWAY_API_KEY (for AI model access)
# - AUTH_SECRET (generate with: openssl rand -base64 32)
# - Other provider-specific keys as needed
```

### 3. Set Up Database

// turbo
```bash
# Run database migrations
pnpm db:migrate
```

### 4. Start Development Server

// turbo
```bash
# Start the Next.js dev server
pnpm dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

## Verification

- [ ] Dependencies installed without errors
- [ ] Environment variables configured
- [ ] Database migrations completed successfully
- [ ] Dev server starts without errors
- [ ] Can access application at localhost:3000

## Common Issues

### Database Connection Errors
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database credentials and permissions

### Missing Environment Variables
- Review .env.example for all required variables
- Ensure .env.local is in the project root
- Restart dev server after changing environment variables

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
pnpm dev -- -p 3001
```

## Next Steps

After setup is complete:
- Review [AGENTS.md](../../AGENTS.md) for coding standards
- Check [docs/architecture-overview.md](../../docs/architecture-overview.md) for system architecture
- See [docs/testing.md](../../docs/testing.md) for testing guidelines
