# TypeRace - Typing Speed Game

## Overview

TypeRace is a web-based typing speed game that challenges users to type quotes accurately and quickly. The application fetches random quotes from an external API and provides real-time feedback on typing performance, including words per minute (WPM) and accuracy metrics.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend concerns:

- **Frontend**: React-based SPA using Vite for build tooling
- **Backend**: Express.js server with API proxy functionality and database integration
- **Database**: PostgreSQL with Drizzle ORM for storing user accounts and typing test results
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state, local React state for game logic

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for utility-first styling
- **React Query** for efficient API state management

### Backend Architecture
- **Express.js** server with TypeScript
- **API Proxy** to handle CORS issues with external quote service
- **Fallback System** with hardcoded quotes when external API fails
- **Development Hot Reload** using Vite middleware in development mode

### Game Logic
- **Real-time Typing Detection** with character-by-character validation
- **Performance Metrics** calculation (WPM, accuracy, error tracking)
- **Timer Management** for tracking elapsed time
- **Visual Feedback** for correct/incorrect characters

## Data Flow

1. **Quote Fetching**: Frontend requests quote through backend proxy
2. **Game Initialization**: Quote data populates game state
3. **Real-time Typing**: User input triggers immediate validation and UI updates
4. **Performance Calculation**: Metrics computed on each keystroke
5. **Game Completion**: Final statistics displayed in modal dialog

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority
- **Backend**: Express.js, CORS handling
- **Development**: Vite, TypeScript, ESBuild

### External Services
- **Quotable API** (api.quotable.io) for random quotes with fallback system
- **Neon Database** driver configured for PostgreSQL connection

### Development Tools
- **Drizzle ORM** for database schema management
- **Zod** for runtime type validation
- **PostCSS** with Autoprefixer for CSS processing

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Build Process**: Vite builds frontend assets, ESBuild bundles server code
- **Production Mode**: Serves static files from Express server
- **Development Mode**: Uses Vite dev server with HMR
- **Database**: PostgreSQL 16 module enabled for future data persistence
- **Port Configuration**: Server runs on port 5000, external port 80

### Environment Configuration
- Database URL required for Drizzle configuration
- NODE_ENV determines development vs production behavior
- Replit-specific plugins enabled for development experience

## Project Documentation

### Installation & Setup Files
- **README.md** - Comprehensive installation guide and project documentation
- **DEPENDENCIES.md** - Complete list of all npm dependencies with descriptions
- **package.json** - Node.js dependency management and scripts
- **drizzle.config.ts** - Database ORM configuration

### Key Configuration Files
- **vite.config.ts** - Build tool configuration for development and production
- **tailwind.config.ts** - CSS framework configuration with custom theme
- **tsconfig.json** - TypeScript compiler settings and path aliases

## Changelog

- June 28, 2025. Added comprehensive documentation
  - Created detailed README.md with installation instructions
  - Added DEPENDENCIES.md listing all npm packages
  - Documented project structure and troubleshooting guide
  - Included deployment instructions for Replit and manual setup
- June 27, 2025. Added audio synchronization feature
  - Implemented text-to-speech audio that plays at user's typing speed
  - Added audio controls with enable/disable toggle and base speed adjustment
  - Audio automatically adjusts playback rate based on typing performance
  - Audio stops and starts appropriately with game state changes
  - Enhanced UI with audio control panel and updated instructions
  - Improved voice quality with natural voice selection and speech variations
  - Added voice selection dropdown to choose from available system voices
  - Enhanced audio chunking to read complete words for natural speech flow
  - Modified audio behavior to speak complete words when user starts typing first letter
  - Audio predicts and pronounces the whole word as soon as typing begins
  - Perfect for learning pronunciation and word recognition while typing
- June 27, 2025. Added PostgreSQL database integration
  - Created user accounts and typing test result storage
  - Added user login/registration system
  - Implemented best score tracking and progress saving
  - Enhanced UI with user profile display and login dialogs
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.