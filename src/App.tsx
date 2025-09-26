import * as React from 'react'
import { 
  createRouter, 
  RouterProvider, 
  createRootRoute, 
  createRoute as createTanStackRoute, 
  Outlet 
} from '@tanstack/react-router'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./<applaa-write path="src/App.tsx">
import * as React from 'react'
import { 
  createRouter, 
  RouterProvider, 
  createRootRoute, 
  createRoute as createTanStackRoute, 
  Outlet 
} from '@tanstack/react-router'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create root route
const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Outlet />
      </TooltipProvider>
    </QueryClientProvider>
  ),
})

// Create routes
const indexRoute = createTanStackRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

const gameRoute = createTanStackRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: Game,
})

const leaderboardRoute = createTanStackRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: Leaderboard,
})

const settingsRoute = createTanStackRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
})

const dailyRoute = createTanStackRoute({
  getParentRoute: () => rootRoute,
  path: '/daily',
  component: () => {
    window.location.href = '/game?isDaily=true'; // Simple redirect with flag (handle in Game via search params if needed)
    return <div>Redirecting to Daily...</div>;
  },
})

// Catch-all for 404
const notFoundRoute = createTanStackRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
})

// Create route tree
const routeTree = rootRoute.addChildren([indexRoute, gameRoute, leaderboardRoute, settingsRoute, dailyRoute, notFoundRoute])

// Create router
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent' as const,
  defaultPreloadStaleTime: 0,
})

// Register for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => <RouterProvider router={router} />

export default App;