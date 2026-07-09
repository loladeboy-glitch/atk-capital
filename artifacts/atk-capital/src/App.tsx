import { useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Splash from '@/pages/splash';
import Login from '@/pages/login';
import { Route, Switch, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const AUTH_STORAGE_KEY = 'atk_authenticated';

type Screen = 'splash' | 'login' | 'dashboard';

function AppScreens() {
  const [screen, setScreen] = useState<Screen>('splash');

  const handleSplashDone = useCallback(() => {
    const alreadyAuthenticated = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    setScreen(alreadyAuthenticated ? 'dashboard' : 'login');
  }, []);

  const handleLoginSuccess = useCallback(() => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
    setScreen('dashboard');
  }, []);

  return (
    <AnimatePresence mode="wait">
      {screen === 'splash' && <Splash key="splash" onDone={handleSplashDone} />}
      {screen === 'login' && <Login key="login" onSuccess={handleLoginSuccess} />}
      {screen === 'dashboard' && <Home key="dashboard" />}
    </AnimatePresence>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppScreens} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;