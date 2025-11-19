import React, { Suspense, lazy } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CameraDetailScreen } from '../screens/CameraDetailScreen';
import { useTranslation } from '../context/LocalizationContext';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export type DashboardStackParamList = {
  Dashboard: undefined;
  CameraDetail: { cameraId: string };
};

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardStackScreen = () => {
  const { t } = useTranslation();
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerTintColor: '#00f7ff',
        headerStyle: { backgroundColor: '#050505' },
        headerTitleStyle: { fontFamily: 'System' },
      }}
    >
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('nav.cameras') }} />
      <DashboardStack.Screen
        name="CameraDetail"
        component={CameraDetailScreen}
        options={{ title: t('nav.cameraDetail') }}
      />
    </DashboardStack.Navigator>
  );
};

const LogsScreen = lazy(() => import('../screens/LogsScreen').then((m) => ({ default: m.LogsScreen })));
const SettingsScreen = lazy(() => import('../screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })));
const HelpScreen = lazy(() => import('../screens/HelpScreen').then((m) => ({ default: m.HelpScreen })));

const Tab = createBottomTabNavigator();

const SuspenseFallback = () => (
  <View style={styles.fallbackContainer}>
    <ActivityIndicator color="#00f7ff" />
    <Text style={styles.fallbackText}>Loading module...</Text>
  </View>
);

export const RootNavigator = () => {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#050505', borderTopColor: '#1f1f1f' },
          tabBarActiveTintColor: '#00f7ff',
          tabBarInactiveTintColor: '#7c7c7c',
          tabBarIcon: ({ color, size }) => {
            const iconMap: Record<string, string> = {
              Dashboard: 'videocam',
              Logs: 'list',
              Settings: 'settings',
              Help: 'help-circle',
            };
            const name = iconMap[route.name] ?? 'ellipse';
            return <Ionicons name={name as any} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardStackScreen} options={{ tabBarLabel: t('nav.dashboard') }} />
        <Tab.Screen name="Logs" component={LogsScreen} options={{ tabBarLabel: t('nav.logs') }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('nav.settings') }} />
        <Tab.Screen name="Help" component={HelpScreen} options={{ tabBarLabel: t('nav.help') }} />
      </Tab.Navigator>
    </Suspense>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050505',
  },
  fallbackText: {
    color: '#c1c6de',
    marginTop: 8,
  },
});
