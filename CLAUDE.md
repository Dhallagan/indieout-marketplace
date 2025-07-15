# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Build a comprehensive Etsy-style marketplace web application specifically designed for independent outdoor brands to sell their products. This should be a modern, scalable platform that connects outdoor enthusiasts with authentic, gear makers.

This is a full-stack project with a **React/TypeScript frontend** and **Rails API backend**, organized as a monorepo with automated type synchronization.

## Development Commands

### Root Level Commands

- `npm run dev` - Start both Rails API and React client in development mode
- `npm run build` - Build React client for production
- `npm start` - Start Rails API in production mode
- `npm run install:all` - Install dependencies for root, client, and Rails API
- `npm run generate:types` - Generate TypeScript types from Rails API

### Client Commands (React/Vite)

- `cd client && npm run dev` - Start development server (port 3000)
- `cd client && npm run build` - Build for production
- `cd client && npm run preview` - Preview production build

### Rails API Commands

- `cd api && rails server` - Start Rails API server (port 5000)
- `cd api && rails console` - Open Rails console
- `npm run db:create` - Create database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset and recreate database
- `cd api && bundle exec rspec` - Run API tests

## Project Structure

```
/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Helper functions
│   │   ├── styles/        # CSS/Tailwind files
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API service functions
│   │   └── types/         # TypeScript type definitions (including auto-generated)
│   ├── public/            # Static assets
│   └── package.json       # Client dependencies
├── api/                   # Rails API backend
│   ├── app/
│   │   ├── controllers/   # API controllers
│   │   ├── models/        # ActiveRecord models
│   │   ├── serializers/   # JSON API serializers
│   │   └── services/      # Business logic services
│   ├── db/
│   │   ├── migrate/       # Database migrations
│   │   └── seeds.rb       # Sample data
│   ├── config/            # Rails configuration
│   └── Gemfile            # Ruby dependencies
├── scripts/               # Development scripts
│   └── generate-types.js  # TypeScript type generation
├── shared/                # Shared utilities
└── docs/                  # Documentation
```

## Technical Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **Backend**: Ruby on Rails 7.1 (API-only mode)
- **Database**: PostgreSQL with ActiveRecord ORM
- **Authentication**: JWT with bcrypt (Rails has_secure_password)
- **API Serialization**: JSONAPI::Serializer for consistent JSON responses
- **Type Safety**: Automated TypeScript type generation from Rails serializers
- **File Storage**: Local storage for development
- **Payment**: Stripe integration (planned)
- **Validation**: Rails validations + dry-validation gem

## Core Features Implemented

### Phase 1: Foundation ✅

- Monorepo structure with React client and Rails API
- TypeScript configuration with automated type generation from Rails
- PostgreSQL database with comprehensive Rails schema
- User authentication system with JWT and Rails has_secure_password
- Role-based access control (System Admin, Seller Admin, Consumer)
- JSONAPI serializers for consistent API responses
- React app with routing and authentication context

### Database Schema

The Rails models include:

- **Users** with role enum and authentication fields (email verification, password reset)
- **Stores** for seller management with verification status and metrics
- **Categories** with self-referential hierarchical structure
- **Products** with status enum, pricing, inventory, and media fields
- **Orders** with complete e-commerce workflow (planned)
- **Reviews** and ratings system (planned)
- **Cart** and wishlist functionality (planned)
- **Addresses** for shipping (planned)

### Authentication System

- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality
- Role-based route protection
- Middleware for authentication and authorization

## Current Status

**Phase 1 Complete**: Basic authentication and user management system is fully functional with:

- User registration/login pages
- Protected routes
- Role-based dashboards
- JWT authentication middleware
- Comprehensive database schema

**Next Phase**: Implement core marketplace features (categories, products, stores)

## Environment Setup

1. Copy `.env.example` to `.env` and configure:
   - Database URL (PostgreSQL)
   - JWT secret
   - SMTP settings for email
2. Install dependencies: `npm run install:all`
3. Set up database: `cd server && npm run db:push`
4. Start development: `npm run dev`

## Frontend/Backend Synchronization

**The Key Innovation**: This project solves the common problem of keeping frontend and backend types in sync using automated type generation:

### How It Works

1. **Rails Serializers** define the API response structure using `JSONAPI::Serializer`
2. **Type Generation Script** (`scripts/generate-types.js`) reads the serializer patterns and generates TypeScript interfaces
3. **Frontend Services** use the generated types for type-safe API communication
4. **Development Workflow**: Run `npm run generate:types` after changing Rails models/serializers

### Benefits

- **Zero Type Drift**: Frontend types always match backend API responses
- **Compile-Time Safety**: TypeScript catches API mismatches during development
- **Developer Experience**: Auto-completion and IntelliSense for all API responses
- **Refactoring Confidence**: Changes to Rails models automatically update frontend types

## Important Notes

- The app uses TypeScript throughout with automated type generation from Rails
- Tailwind CSS is configured for styling
- API routes are prefixed with `/api/v1`
- Client dev server proxies API calls to Rails backend (port 5000)
- All authentication requires email verification
- Role-based access control is implemented at both frontend and backend levels
- Run `npm run generate:types` after any changes to Rails serializers
