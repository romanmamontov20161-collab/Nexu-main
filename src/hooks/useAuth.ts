import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User, AuthState } from '../types/app';
import { getCurrentUser } from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'nexu_has_seen_onboarding';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        // 1. Проверяем онбординг
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (isMounted) setHasSeenOnboarding(seen === 'true');

        // 2. Проверяем сессию (быстро)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          const user = await getCurrentUser();
          setAuthState({ isAuthenticated: !!user, isLoading: false, user });
        } else if (isMounted) {
          setAuthState({ isAuthenticated: false, isLoading: false, user: null });
        }
      } catch (e) {
        if (isMounted) setAuthState({ isAuthenticated: false, isLoading: false, user: null });
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const user = await getCurrentUser();
          setAuthState({ isAuthenticated: true, isLoading: false, user });
        } else {
          setAuthState({ isAuthenticated: false, isLoading: false, user: null });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
  };

  return { ...authState, hasSeenOnboarding, completeOnboarding };
};
