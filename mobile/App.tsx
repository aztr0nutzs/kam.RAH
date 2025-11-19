import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { RootNavigator } from './src/navigation/AppNavigator';
import { AuthScreen } from './src/screens/AuthScreen';
import { ShieldedBoundary } from './src/components/ShieldedBoundary';
import { RealmProvider } from './src/persistence';
import { OnboardingCarousel } from './src/components/OnboardingCarousel';
import { LocalizationProvider } from './src/context/LocalizationContext';

const ONBOARDING_KEY = 'kamrah-mobile:onboarding-v1';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingReady, setOnboardingReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      if (!isAuthenticated) {
        setShowOnboarding(false);
        setOnboardingReady(true);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (isMounted) {
          setShowOnboarding(!stored);
        }
      } finally {
        if (isMounted) {
          setOnboardingReady(true);
        }
      }
    };
    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleCompleteOnboarding = useCallback(async () => {
    setShowOnboarding(false);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'ack');
  }, []);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <DataProvider>
          <RootNavigator />
          {onboardingReady && (
            <OnboardingCarousel visible={showOnboarding} onComplete={handleCompleteOnboarding} />
          )}
        </DataProvider>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocalizationProvider>
          <RealmProvider>
            <AuthProvider>
              <ShieldedBoundary>
                <AppContent />
              </ShieldedBoundary>
              <StatusBar style="light" />
            </AuthProvider>
          </RealmProvider>
        </LocalizationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
