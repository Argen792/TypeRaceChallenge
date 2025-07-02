# TypeRace Dependencies

This document lists all dependencies for the TypeRace typing game project.

## Package Manager

This project uses **npm** (Node Package Manager) for dependency management. All dependencies are defined in `package.json`.

## Installing Dependencies

To install all dependencies at once:

```bash
npm install
```

## Production Dependencies

### Core Framework
- **react** (^18.3.1) - Core React library
- **react-dom** (^18.3.1) - React DOM renderer
- **react-hook-form** (^7.53.2) - Form handling and validation
- **wouter** (^3.3.7) - Lightweight routing for React

### Backend Server
- **express** (^4.21.1) - Web server framework
- **express-session** (^1.18.1) - Session management
- **passport** (^0.7.0) - Authentication middleware
- **passport-local** (^1.0.0) - Local authentication strategy
- **connect-pg-simple** (^10.0.0) - PostgreSQL session store
- **memorystore** (^1.6.7) - Memory session store for development

### Database
- **@neondatabase/serverless** (^0.10.4) - Serverless PostgreSQL driver
- **drizzle-orm** (^0.37.0) - TypeScript ORM
- **drizzle-zod** (^0.5.1) - Zod integration for Drizzle

### State Management
- **@tanstack/react-query** (^5.62.8) - Server state management

### UI Components & Styling
- **@radix-ui/react-*** (various) - Accessible UI primitives
  - react-accordion, react-alert-dialog, react-avatar
  - react-checkbox, react-dialog, react-dropdown-menu
  - react-label, react-popover, react-select, react-separator
  - react-slider, react-switch, react-tabs, react-toast
  - react-tooltip, and more
- **tailwindcss** (^3.4.17) - Utility-first CSS framework
- **@tailwindcss/typography** (^0.5.15) - Typography plugin
- **tailwindcss-animate** (^1.0.7) - Animation utilities
- **tailwind-merge** (^2.5.5) - Tailwind class merging utility
- **class-variance-authority** (^0.7.1) - Component variant styling
- **clsx** (^2.1.1) - Conditional className utility
- **lucide-react** (^0.468.0) - Icon library
- **react-icons** (^5.4.0) - Additional icon sets

### Form & Validation
- **@hookform/resolvers** (^3.10.0) - Form validation resolvers
- **zod** (^3.24.1) - Schema validation
- **zod-validation-error** (^3.4.0) - Better Zod error messages

### UI Enhancement
- **framer-motion** (^12.0.3) - Animation library
- **embla-carousel-react** (^8.5.1) - Carousel component
- **react-day-picker** (^9.4.4) - Date picker component
- **react-resizable-panels** (^2.1.7) - Resizable panel layouts
- **recharts** (^2.13.3) - Chart library
- **input-otp** (^1.4.1) - OTP input component
- **cmdk** (^1.0.4) - Command palette component
- **vaul** (^1.1.1) - Drawer component
- **next-themes** (^0.4.4) - Theme switching

### Utilities
- **date-fns** (^4.1.0) - Date utility functions
- **tw-animate-css** (^0.1.11) - CSS animations for Tailwind

### WebSocket (if needed)
- **ws** (^8.18.0) - WebSocket library

## Development Dependencies

### Build Tools
- **vite** (^6.0.7) - Build tool and dev server
- **@vitejs/plugin-react** (^4.3.4) - React plugin for Vite
- **@replit/vite-plugin-cartographer** (^1.1.9) - Replit integration
- **@replit/vite-plugin-runtime-error-modal** (^1.0.8) - Error handling
- **esbuild** (^0.24.2) - JavaScript bundler

### TypeScript
- **typescript** (^5.7.2) - TypeScript compiler
- **@types/react** (^18.3.17) - React type definitions
- **@types/react-dom** (^18.3.5) - React DOM type definitions
- **@types/express** (^5.0.0) - Express type definitions
- **@types/express-session** (^1.18.0) - Express session types
- **@types/passport** (^1.0.16) - Passport type definitions
- **@types/passport-local** (^1.0.38) - Passport local types
- **@types/connect-pg-simple** (^7.0.3) - Session store types
- **@types/node** (^22.10.2) - Node.js type definitions
- **@types/ws** (^8.5.13) - WebSocket type definitions

### Development Server
- **tsx** (^4.19.2) - TypeScript execution for Node.js

### CSS Processing
- **postcss** (^8.5.8) - CSS processor
- **autoprefixer** (^10.4.20) - CSS vendor prefixing
- **@tailwindcss/vite** (^4.0.0-beta.6) - Tailwind Vite plugin

### Database Development
- **drizzle-kit** (^0.31.2) - Database migrations and introspection

## Installation Commands by Category

### Install All Dependencies
```bash
npm install
```

### Add New Production Dependency
```bash
npm install package-name
```

### Add New Development Dependency
```bash
npm install -D package-name
```

### Update All Dependencies
```bash
npm update
```

### Check for Outdated Packages
```bash
npm outdated
```

## Package.json Scripts

The following scripts are available:

```bash
# Development
npm run dev          # Start development server

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open database management interface

# Production
npm run build        # Build for production
npm start           # Start production server
```

## Dependency Management Best Practices

1. **Pin Major Versions**: Using `^` for semantic versioning
2. **Regular Updates**: Check for updates monthly
3. **Security Audits**: Run `npm audit` regularly
4. **Lock File**: Commit `package-lock.json` for reproducible builds
5. **Clean Installs**: Use `npm ci` in production environments

## Version Compatibility

- **Node.js**: 18.x or higher required
- **npm**: 8.x or higher recommended
- **TypeScript**: 5.x for latest features
- **React**: 18.x for concurrent features

## License Information

All dependencies are compatible with MIT license usage. Check individual package licenses for specific terms.