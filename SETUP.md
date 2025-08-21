# Project Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm package manager

## Installation Steps

### 1. Clone/Copy Project
```bash
# Copy all project files to your server
# Ensure all files and folders are transferred
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Choose one option:

#### Option A: Copy existing database
```bash
# Copy the existing database file
cp db/custom.db /path/to/your/project/db/
```

#### Option B: Initialize new database
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

### 4. Environment Variables (Optional)
If your project requires environment variables, create a `.env` file:
```bash
# Create .env file if needed
touch .env
```

### 5. Run the Project

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
# Build the project
npm run build

# Start production server
npm start
```

## Verification

1. Check if the server starts without errors
2. Access the application in your browser
3. Verify database connectivity
4. Test core functionality

## Troubleshooting

### Common Issues

- **Port conflicts**: Ensure the port used by the server is available
- **Permission errors**: Check file permissions, especially for database files
- **Module not found**: Run `npm install` again or check Node.js version
- **Database errors**: Verify database file exists and has proper permissions

### Useful Commands

```bash
# Check dependencies
npm list

# Run linting
npm run lint

# Database operations
npm run db:migrate    # Run migrations
npm run db:reset      # Reset database
```

## Project Structure

```
hesabdar/
├── src/                 # Source code
├── db/                  # Database files
├── prisma/              # Database schema
├── public/              # Static assets
├── package.json         # Dependencies
└── server.ts           # Custom server entry point
```

## Notes

- This project uses a custom Express server with Socket.io
- Database is SQLite-based (local file)
- Hot reloading is handled by nodemon, not Next.js
- TypeScript compilation is handled by tsx