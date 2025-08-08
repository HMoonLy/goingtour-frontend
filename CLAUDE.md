# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoingTour is a Vue 3 travel planning application that helps users create personalized trip itineraries with AI assistance. Users can select destinations, set preferences, and generate customized travel plans.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview

# Lint and fix code issues
npm run lint
```

## Architecture

### Tech Stack
- **Frontend**: Vue 3 + Composition API
- **UI Framework**: Element Plus with icons
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite
- **HTTP Client**: Axios with custom interceptors
- **Internationalization**: Custom i18n utility
- **File Upload**: Ali OSS integration

### Key Directories
```
src/
├── api/           # API service modules (user, trip, weather, etc.)
├── components/    # Reusable Vue components organized by domain
├── pages/         # Route-level page components 
├── layouts/       # Layout components (DefaultLayout, AuthLayout)
├── store/         # Pinia stores (user, trip)
├── router/        # Vue Router configuration
├── utils/         # Utility functions and helpers
├── data/          # Static data (AI scenarios, trip templates)
├── locales/       # i18n translation files
└── styles/        # Global stylesheets and themes
```

### Core Components Structure
- `components/Common/` - Shared components (LoadingSpinner, UserAvatar, etc.)
- `components/Trip/` - Trip-specific components (TripGeneration, TripPreview, etc.)
- `components/User/` - User-related components (UserCenterNav)

### State Management
- **User Store** (`store/user.js`): Handles authentication, user info, preferences, JWT token management
- **Trip Store** (`store/trip.js`): Manages trip data, generation, CRUD operations

### Authentication Flow
- JWT-based authentication with access/refresh tokens
- Automatic token refresh before expiration (5-minute buffer)
- Token storage in localStorage with expiry tracking
- Route guards for protected pages

### API Integration
- Custom axios instance with request/response interceptors
- Automatic token attachment and refresh
- Centralized error handling with Element Plus messages
- Base URL proxy to `/api` endpoint (configured in vite.config.js)

### Routing Architecture
- Default layout with sticky navigation for authenticated pages
- Auth layout for login/register pages
- Route meta properties for authentication and title management
- Automatic redirects based on auth status

### Key Features
- **AI Trip Generation**: Uses preset scenarios from `data/aiScenarios.js`
- **City Selection**: Integration with city codes data
- **User Preferences**: Comprehensive preference management system
- **Trip Collaboration**: Support for sharing and collaborative editing
- **Internationalization**: Multi-language support with Vue i18n
- **Theme Support**: Dark/light mode with CSS variables
- **PWA Features**: Service worker and offline support
- **Accessibility**: Built-in accessibility features

### Development Notes
- Uses `@` alias for `src/` directory imports
- Development server proxies `/api` requests to `http://localhost:8080`
- ESLint configured with Vue and Prettier rules
- Test user functionality available in development mode
- Console debugging utilities for user state management

### Important Files
- `src/main.js` - Application initialization and global setup
- `src/router/router.js` - Route definitions and navigation guards
- `src/api/request.js` - HTTP client configuration and interceptors
- `src/data/aiScenarios.js` - AI trip generation presets
- `vite.config.js` - Build configuration and dev server proxy