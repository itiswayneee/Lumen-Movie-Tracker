# Lumen - Cinematic Movie Tracker

A beautiful glassmorphism movie tracker powered by the Trakt API. Discover trending and popular movies, manage your watchlist, track watched history, and get personalized recommendations.

## Features

- 🎬 **Trending Movies**: See what the world is watching right now
- 🌟 **Popular Movies**: Browse the most popular films
- 🔍 **Movie Search**: Search for any movie title
- 📋 **Watchlist**: Save movies to watch later (requires Trakt account)
- 👁️ **Watched History**: Track movies you've watched (requires Trakt account)
- 💡 **Personalized Recommendations**: Get movie suggestions based on your taste (requires Trakt account)
- 🎨 **Glassmorphism UI**: Stunning frosted glass design with smooth animations
- 📱 **Responsive**: Works on desktop and mobile devices
- 🔐 **Secure**: Your Trakt API key is stored only in your browser

## Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Styling**: TailwindCSS with custom glassmorphism effects
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: Custom Trakt API integration
- **Notifications**: Sonner toast notifications
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun
- A [Trakt.tv](https://trakt.tv/) account (free)

### Installation

1. Clone the repository
```bash
git clone https://github.com/wayne-inc/lumen-movie-tracker.git
cd lumen-movie-tracker
```

2. Install dependencies
```bash
# Using npm
npm install

# Or using bun
bun install
```

3. Get your Trakt API credentials:
   - Go to [Trakt API Applications](https://trakt.tv/oauth/applications)
   - Create a new application
   - Set the redirect URI to `http://localhost:5173/callback` (for development)
   - Note your Client ID and Client Secret

4. Start the development server
```bash
# Using npm
npm run dev

# Or using bun
bun run dev
```

5. Open your browser to `http://localhost:5173`

## Building for Production

```bash
# For production build
npm run build

# For development build (with sourcemaps)
npm run build:dev

# Preview the production build
npm run preview
```

## API Integration

This project uses the [Trakt API](https://trakt.docs.apiary.io/) to fetch movie data. The API integration is handled in `src/lib/trakt.ts` and includes:

- Trending movies endpoint
- Popular movies endpoint
- Movie search functionality
- User authentication (device flow)
- Watchlist management
- Watched history tracking
- Personalized recommendations

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development (with sourcemaps)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Acknowledgements

- [Trakt.tv](https://trakt.tv/) for providing the movie and TV show data
- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the icons
- [Sonner](https://sonner.emilkowal.ski/) for the toast notifications
- [TanStack Query](https://tanstack.com/query) for the data fetching and state management

---

Made with ❤️ for movie lovers
