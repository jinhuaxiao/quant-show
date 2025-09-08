# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Install dependencies (if pnpm-lock.yaml exists, use pnpm)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Architecture Overview

This is a Next.js 15 application with App Router, focused on quantitative trading visualization and algorithmic optimization demonstrations.

### Core Structure
- **App Router**: All routes are in `/app` directory using Next.js 15 App Router patterns
- **Two Main Sections**:
  - `/` - Algorithm complexity visualization (Medallion Algorithm demo)
  - `/trading` - Interactive trading system simulation

### Key Patterns
- **Client Components**: Most interactive components use `'use client'` directive
- **Custom Hooks**: System state management via hooks in `/hooks` directory (e.g., `use-trading-system.ts`)
- **Component Organization**: 
  - Shared UI components in `/components/ui` (shadcn/ui based)
  - Page-specific components in `/app/components` and `/app/trading/components`
- **Styling**: Tailwind CSS v4 with custom configuration, dark theme optimized
- **TypeScript**: Strict mode enabled with path alias `@/*` pointing to root

### State Management
The trading system uses a custom hook pattern (`useTradingSystem`) for complex state management including:
- Factor selection and correlation analysis
- Optimization algorithms (genetic, particle swarm, LASSO)
- Performance tracking and system logs
- Real-time process flow indicators

### UI Components
Uses Radix UI primitives wrapped with shadcn/ui patterns:
- Toast notifications via `useToast` hook
- Dialog, Progress, Badge, Button, Card components
- Class variance authority (CVA) for component variants

### Performance
- Turbopack enabled for faster builds
- Next.js font optimization with Geist fonts
- Framer Motion for animations