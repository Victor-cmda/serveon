# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Serveon** is a comprehensive ERP system built with NestJS backend and React frontend, focused on Brazilian business management with support for NFe (Electronic Invoice), customer/supplier management, HR modules, and inventory control.

## Architecture

### Backend (NestJS + PostgreSQL)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with raw SQL queries (no ORM)
- **Architecture**: Modular structure with controllers, services, DTOs, and entities
- **Database Service**: Custom database connection pool management in `src/common/database/`

### Frontend (React + Vite)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **Routing**: React Router v7
- **State Management**: React Hooks + Context API
- **Theming**: next-themes with custom theme transitions

### Key Modules
1. **Customer Management** (`src/modules/customers/`) - Complete CRUD for clients
2. **Employee Management** (`src/modules/employees/`) - HR functions including departments and positions  
3. **Product Management** (`src/modules/products/`) - Products, categories, brands, units
4. **Vehicle Management** (`src/modules/vehicles/`) - Transport vehicle control
5. **Database Schema** - Complex ERP schema with 50+ tables for NFe, sales, purchases, inventory

### Database Architecture
- **Schema**: Single `dbo` schema with comprehensive Brazilian ERP structure
- **Key Tables**: cliente, fornecedor, funcionario, produto, nfe, venda, compra
- **Features**: Full audit trails, soft deletes, Brazilian tax compliance
- **Deployment**: Scripts in `deploy-db.sql` for production setup

## Development Commands

### Full Application
```bash
# Start both backend and frontend in development
yarn dev

# Build both backend and frontend for production
yarn build:full
```

### Backend Only
```bash
# Start in development mode with hot reload
yarn start:dev

# Start in debug mode  
yarn start:debug

# Build for production
yarn build

# Start production server
yarn start:prod

# Format code
yarn format

# Lint and fix code
yarn lint
```

### Frontend Only
```bash
# Start frontend development server
yarn frontend:dev

# Build frontend for production
yarn frontend:build
```

### Testing
```bash
# Run unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:cov

# Run end-to-end tests (requires PostgreSQL setup)
yarn test:e2e

# Debug tests
yarn test:debug
```

### Database Management
```bash
# Setup test database before running e2e tests
yarn pretest:e2e
```

## Development Environment Setup

### Prerequisites
1. **Node.js** (v18+) and **Yarn**
2. **PostgreSQL** database server
3. **Git** for version control

### Environment Configuration
Create `.env` file in root directory:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=serveon
PORT=3000
```

For testing, create `.env.test`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=serveon_test
```

### Initial Setup
```bash
# Install dependencies
yarn install

# Setup database schema (production)
psql -U postgres -d serveon -f deploy-db.sql

# Setup test database  
psql -U postgres -d serveon_test -f postgres.sql
```

## Code Organization

### Backend Structure
```
src/
├── common/database/          # Database service and configuration
├── modules/                  # Business modules
│   ├── customers/           # Customer management
│   │   ├── controllers/     # REST endpoints
│   │   ├── services/        # Business logic
│   │   ├── dto/            # Data transfer objects
│   │   └── entities/       # TypeScript interfaces
│   ├── employees/          # HR management
│   ├── products/           # Product catalog
│   └── vehicles/           # Vehicle management
├── app.module.ts           # Main application module
└── main.ts                 # Application bootstrap
```

### Frontend Structure
```
frontend/src/
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components (Radix + Tailwind)
│   ├── Layout.tsx         # Main application layout
│   ├── Navbar.tsx         # Top navigation
│   └── Sidebar.tsx        # Sidebar navigation
├── pages/                 # Route-specific page components
│   ├── customers/         # Customer management pages
│   ├── employees/         # Employee management pages
│   └── products/          # Product management pages
├── contexts/              # React context providers
├── Routes.tsx             # Application routing
└── main.tsx              # Application entry point
```

## Key Development Guidelines

### Database Operations
- Always use transactions for multi-table operations
- Implement proper error handling with try-catch blocks
- Use parameterized queries to prevent SQL injection
- Follow the existing database naming conventions (snake_case)

### API Development
- Controllers handle HTTP requests/responses only
- Services contain all business logic
- Use DTOs for request/response validation
- Implement comprehensive error handling
- Follow NestJS decorators for API documentation

### Frontend Development  
- Use TypeScript for all components
- Follow React Hook patterns for state management
- Implement responsive design with Tailwind classes
- Use React Router for navigation
- Handle loading and error states properly

### Code Style
- Use Prettier for consistent formatting
- Follow ESLint rules for code quality
- Use meaningful variable and function names
- Write comprehensive JSDoc comments for public APIs

## Deployment

### Production Database Setup
Execute the comprehensive schema setup:
```sql
-- Run the complete deploy-db.sql script
\i deploy-db.sql
```

### Application Deployment
The project includes deployment configuration for:
- **Backend**: Render.com (see DEPLOYMENT.md)
- **Frontend**: Vercel (see DEPLOYMENT.md) 
- **Database**: Render PostgreSQL (see DEPLOYMENT.md)

## Testing Strategy

### Backend Testing
- Unit tests for services using Jest
- Integration tests for database operations
- E2E tests for complete API workflows
- Test database isolation using transactions

### Frontend Testing
- Component testing with React Testing Library (when added)
- Integration tests for user workflows
- Visual regression testing (planned)

## Troubleshooting

### Common Database Issues
- Ensure PostgreSQL service is running
- Check database connection parameters in `.env`
- Verify database schema is properly initialized
- Check for connection pool exhaustion in logs

### Development Server Issues
- Clear `node_modules` and reinstall dependencies
- Check port availability (3000 for backend, 5173 for frontend)
- Verify environment variables are properly set
- Check console logs for specific error messages

## Performance Considerations

### Database Optimization
- Indexes are automatically created for foreign keys
- Use EXPLAIN ANALYZE for query optimization
- Connection pooling is handled by the database service
- Implement pagination for large result sets

### Frontend Optimization
- Vite provides fast development builds
- Code splitting is handled by React Router
- Images and assets are optimized by Vite
- Bundle analysis available through Vite plugins
