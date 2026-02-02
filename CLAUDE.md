# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Setup and Dependencies
- `npm run setup` - Initial project setup: installs dependencies, generates Prisma client, and runs migrations
- `npm install` - Install dependencies only
- `npx prisma generate` - Generate Prisma client to `src/generated/prisma/`
- `npx prisma migrate dev` - Run database migrations

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run dev:daemon` - Start dev server in background, logs to `logs.txt`
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Vitest

### Database
- `npm run db:reset` - Reset database and run migrations from scratch

## Architecture Overview

**UIGen** is an AI-powered React component generator with live preview capabilities.

### Core Architecture
- **Next.js 15** with App Router and Turbopack for fast development
- **Virtual File System**: Components are generated and stored in-memory, not written to disk
- **Dual View System**: Chat interface for AI interaction + Code editor with live preview
- **Real-time Component Generation**: Uses Anthropic Claude AI via Vercel AI SDK

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature (auth, chat, editor, preview, ui)
- `src/lib/` - Core utilities, contexts, and business logic
- `src/actions/` - Server actions for database operations
- `prisma/` - Database schema and migrations

### Critical Systems

#### Virtual File System (`src/lib/file-system.ts`)
- In-memory file system for generated components
- Handles file creation, updates, deletion, and tree structure
- Integrated with React context for state management

#### Chat & AI Integration (`src/lib/contexts/chat-context.tsx`)
- Manages conversation state and AI tool calls
- Handles component generation via Anthropic Claude
- Processes tool calls for file operations

#### Database Schema
- **Users**: Authentication with bcrypt passwords
- **Projects**: Stores chat messages and virtual file system state as JSON
- **Prisma Client**: Generated to `src/generated/prisma/` (not standard location)

#### Authentication (`src/lib/auth.ts`)
- JWT-based auth with `jose` library
- Optional anonymous usage (projects stored without user association)
- Bcrypt password hashing

### Technology Stack
- **Framework**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI components
- **Database**: Prisma ORM with SQLite
- **AI**: Anthropic Claude via Vercel AI SDK
- **Testing**: Vitest with React Testing Library
- **Code Editor**: Monaco Editor with syntax highlighting

### Development Notes
- All file operations use the virtual file system - no actual files are written to disk during component generation
- The app can run without an API key (falls back to static code generation)
- Special Node.js compatibility layer via `node-compat.cjs` required for development
- Prisma client generates to non-standard location (`src/generated/prisma/`)
- Use comments sparingly. Only comment complex code.
- The database scheme is defined in the @prisma/schema.prisma file.  Reference it any time you need to understand the structure of the data stored in the database.
- vitest config is in vitest.config.mts