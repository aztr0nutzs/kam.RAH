import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useData } from '../context/DataContext';
import { CameraCard } from '../components/CameraCard';
import { OfflineBanner } from '../components/OfflineBanner';
import { useLocalization, useTranslation } from '../context/LocalizationContext';
import type { DashboardStackParamList } from '../navigation/AppNavigator';

export const DashboardScreen: React.FC = () => {
  const { cameras, refresh, refreshing, toggleFavorite, toggleRecording, isOnline, pendingMutations, syncingMutations } =
    useData();
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();
  const { isRTL } = useLocalization();
  const { t } = useTranslation();
  const directionStyle = useMemo(() => ({ textAlign: isRTL ? 'right' : 'left' }), [isRTL]);

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, directionStyle]}>{t('dashboard.heading')}</Text>
      {!isOnline && (
        <OfflineBanner pendingMutations={pendingMutations} syncingMutations={syncingMutations} />
      )}
      <FlatList
        data={cameras}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#00f7ff" />}
        renderItem={({ item }) => (
          <CameraCard
            camera={item}
            onPress={() => navigation.navigate('CameraDetail', { cameraId: item.id })}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onToggleRecording={() => toggleRecording(item.id)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050b',
    padding: 16,
  },
  heading: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
});
