# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Workflow
- `npm run dev` - Start Vite development server with HMR and API proxy
- `npm run build` - Build for production using Vite
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with Vue support and auto-fix

### Development Server Details
- Dev server runs on default Vite port with API proxy configured
- All `/api/*` requests are proxied to `http://localhost:8080` (backend server)
- Hot reload enabled for Vue components and assets

## Architecture Overview

### Tech Stack
- **Frontend Framework**: Vue 3 with Composition API and `<script setup>` syntax
- **Build Tool**: Vite with fast HMR and optimized production builds
- **State Management**: Pinia for reactive state management with persistence
- **UI Framework**: Element Plus with comprehensive component library and icon set
- **Routing**: Vue Router 4 with authentication guards and nested layouts
- **HTTP Client**: Axios with custom interceptors and unified error handling

### Project Structure Pattern
```
src/
├── layouts/           # Layout components (AuthLayout, DefaultLayout)
├── pages/            # Feature-organized page components
│   ├── User/         # Authentication and profile pages
│   ├── Trip/         # Trip planning and management
│   ├── Data/         # Data display and search
│   └── Error/        # Error pages (404, etc.)
├── components/       # Reusable components organized by feature
├── store/           # Pinia stores (user.js, trip.js)
├── api/             # API interface layer with request.js base
├── router/          # Vue Router configuration with guards
├── assets/          # Static assets and images
└── utils/           # Utility functions and helpers
```

### Key Architectural Patterns

#### Layout-Based Routing
- **AuthLayout**: Used for login/register pages with minimal UI
- **DefaultLayout**: Main application layout with navigation for authenticated users
- Routes are organized by layout and feature modules

#### State Management Strategy
- **User Store** (`store/user.js`): Complete authentication, profile, and preferences management
- **Trip Store** (`store/trip.js`): Trip generation and management (interfaces defined)
- Automatic localStorage persistence with `saveToStorage()` and `restoreFromStorage()`

#### API Integration Layer
- **Base Client** (`api/request.js`): Configured Axios instance with interceptors
- **Feature APIs**: Modular API interfaces (user.js, trip.js, etc.)
- **Error Handling**: Unified response format with business logic error codes (1xxx-9xxx)
- **Authentication**: Automatic token injection and 401 redirect handling

## Current Development Status

### Completed Backend Integration
The user module has complete backend API integration:
- User registration and login with SMS verification
- Profile management (nickname, avatar updates)
- Preference settings with budget and tag selection
- Authentication state persistence and restoration

### API Endpoints Ready
```javascript
// User Authentication
POST /api/user/send-code     // SMS verification
POST /api/user/register      // User registration  
POST /api/user/login         // User login

// User Management
GET  /api/user/{id}          // Get user info
PUT  /api/user/{id}/info     // Update basic info
GET  /api/user/{id}/preferences    // Get preferences
PUT  /api/user/{id}/preferences    // Update preferences
```

### Pending Backend Implementation
Trip and data modules have API interfaces defined but await backend completion:
- Trip generation and management endpoints
- City and attraction data APIs
- Restaurant and venue information
- Search and filtering capabilities

## Development Guidelines

### Authentication Flow
- Login state is managed in Pinia user store with automatic persistence
- Protected routes use `meta: { requiresAuth: true }` with router guards
- Token-based authentication with automatic header injection
- 401 responses trigger automatic logout and redirect to login

### Component Development
- Use Vue 3 Composition API with `<script setup>` syntax
- Follow Element Plus component patterns for UI consistency
- Implement responsive design for mobile compatibility
- Organize components by feature modules (Trip/, User/, Data/)

### API Integration
- Use existing API client from `api/request.js` for all HTTP requests
- Follow established error handling patterns with ElMessage notifications
- Implement loading states and proper error boundaries
- Use Pinia actions for complex state updates involving API calls

### Debug Tools Available
Development environment includes built-in console utilities:
- `clearUserState()` - Clear user login state and reload
- `checkUserState()` - Inspect current user state and token

### Code Style
- ESLint configuration with Vue-specific rules and Prettier integration
- Use existing utility classes and Element Plus theme variables
- Follow established naming conventions for components and stores
- Implement proper TypeScript-style JSDoc comments for better IDE support

## Special Considerations

### Mobile-First Design
- All layouts and components implement responsive design patterns
- Element Plus components are configured for mobile compatibility
- Consider mobile-specific UX patterns for trip planning interface

### Performance Optimization
- Vite provides optimized bundling and code splitting
- Vue Router uses lazy loading for all page components
- Pinia stores implement efficient state updates and persistence
- Element Plus components are tree-shakeable for smaller bundles

### Backend Communication
- Development proxy handles CORS and routing to backend on localhost:8080
- Production deployment should configure proper API base URL
- Error handling accommodates both network and business logic errors
- Authentication token management is fully automated