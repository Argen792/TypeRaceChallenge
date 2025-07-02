# TypeRace - Typing Speed Game

A dynamic web-based typing game that offers an interactive learning experience with advanced audio synchronization and performance tracking features.

## Features

- **Real-time typing performance tracking** - WPM and accuracy calculation
- **Audio synchronization** - Hear words spoken as you type them
- **User accounts and progress tracking** - Save your best scores
- **Custom text support** - Upload files or paste your own text
- **Multiple voice options** - Choose from available system voices
- **Responsive design** - Works on desktop and mobile devices
- **Line break preservation** - Perfect for song lyrics and formatted text

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **Audio**: Web Speech API for text-to-speech
- **State Management**: React Query + React hooks

## Prerequisites

Before installing, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** database (for production) or use the included development setup

## Installation Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd typerace
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React ecosystem (React, React DOM, React Query)
- Express.js server with TypeScript support
- Drizzle ORM for database management
- UI libraries (Radix UI, Tailwind CSS, shadcn/ui)
- Development tools (Vite, ESBuild, TypeScript)

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/typerace

# Development Settings
NODE_ENV=development
PORT=5000
```

For Replit deployment, these environment variables are automatically configured.

### 4. Database Setup

#### For Development (Replit)
The database is automatically provisioned. Run:

```bash
npm run db:push
```

#### For Local Development
1. Install PostgreSQL locally
2. Create a database named `typerace`
3. Update the `DATABASE_URL` in your `.env` file
4. Run the database migration:

```bash
npm run db:push
```

### 5. Start the Development Server

```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers concurrently.

The application will be available at:
- **Local**: http://localhost:5000
- **Network**: Your local IP address on port 5000

## Project Structure

```
typerace/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── App.tsx         # Main app component
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database storage layer
│   ├── db.ts              # Database connection
│   └── vite.ts            # Vite integration
├── shared/                # Shared types and schemas
│   └── schema.ts          # Database schema and types
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── vite.config.ts         # Vite configuration
└── drizzle.config.ts      # Database ORM configuration
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)

# Production Build
npm run build        # Build for production
npm start            # Start production server
```

## Usage Guide

### Basic Typing Game

1. **Start a game**: Click "Get New Quote" or paste your own text
2. **Type along**: Follow the highlighted text and type accurately
3. **View results**: See your WPM, accuracy, and time when finished

### Audio Features

1. **Enable Audio**: Toggle the "Audio Sync" switch
2. **Adjust Speed**: Use the speed slider to control base speech rate
3. **Select Voice**: Choose from available system voices
4. **Type to Hear**: Audio speaks each word when you start typing it

### User Accounts

1. **Register/Login**: Click "Login/Register" button
2. **Track Progress**: Your scores are automatically saved
3. **View Best Score**: See your personal best displayed in the header

### Custom Text

1. **Upload File**: Use the "Your Text" tab and upload a .txt file
2. **Paste Text**: Or paste text directly into the text area
3. **Preserve Formatting**: Line breaks and formatting are maintained

## Database Schema

The application uses the following main tables:

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `created_at` - Registration timestamp

### Typing Tests Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `wpm` - Words per minute score
- `accuracy` - Accuracy percentage
- `time_taken` - Test duration in milliseconds
- `text_length` - Number of characters typed
- `created_at` - Test completion timestamp

## Configuration

### Tailwind CSS
Custom colors and theme configuration in `tailwind.config.ts`:
- Typing game specific colors for correct/incorrect/current characters
- Responsive breakpoints and component styling

### TypeScript
Strict TypeScript configuration with:
- Path aliases for clean imports (`@/components`, `@shared/schema`)
- Type safety across frontend and backend
- Shared type definitions in `shared/schema.ts`

### Vite Development
- Hot module replacement for fast development
- Automatic proxy setup between frontend and backend
- Asset optimization and bundling

## Deployment

### Replit Deployment (Recommended)
1. The project is configured for Replit with automatic deployments
2. Environment variables are automatically configured
3. PostgreSQL database is provisioned automatically
4. Simply click "Deploy" in your Replit project

### Manual Deployment
1. Set up a PostgreSQL database
2. Configure environment variables
3. Build the project: `npm run build`
4. Start the server: `npm start`

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify `DATABASE_URL` is correctly set
- Ensure PostgreSQL is running
- Run `npm run db:push` to initialize tables

**Audio Not Working**
- Check browser permissions for speech synthesis
- Ensure you're using HTTPS in production
- Try different voices from the dropdown

**Build Errors**
- Clear node_modules: `rm -rf node_modules && npm install`
- Update dependencies: `npm update`
- Check Node.js version (18+ required)

**Styling Issues**
- Restart development server
- Clear browser cache
- Check for Tailwind CSS conflicts

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database Changes**: Use `npm run db:push` instead of manual SQL
3. **Type Safety**: Leverage TypeScript for better development experience
4. **Component Library**: Use shadcn/ui components for consistent design

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper TypeScript types
4. Test thoroughly with different text types and audio settings
5. Submit a pull request with detailed description

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the project documentation in `replit.md`
3. Open an issue with detailed reproduction steps