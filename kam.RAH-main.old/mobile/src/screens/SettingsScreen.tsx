import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useData } from '../context/DataContext';
import { NeonButton } from '../components/NeonButton';
import { getLocaleLabel, useLocalization, useTranslation } from '../context/LocalizationContext';

export const SettingsScreen: React.FC = () => {
  const { connectionSettings, updateConnectionSettings } = useData();
  const [apiBaseUrl, setApiBaseUrl] = useState(connectionSettings.apiBaseUrl);
  const [wsUrl, setWsUrl] = useState(connectionSettings.wsUrl);
  const [status, setStatus] = useState<string | null>(null);
  const { t } = useTranslation();
  const { locale, setLocale, availableLocales, isRTL } = useLocalization();
  const directionStyle = useMemo(() => ({ textAlign: isRTL ? 'right' : 'left' }), [isRTL]);

  const handleSave = async () => {
    await updateConnectionSettings({ apiBaseUrl, wsUrl });
    setStatus(t('settings.saved'));
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, directionStyle]}>{t('settings.heading')}</Text>
      <TextInput
        style={styles.input}
        value={apiBaseUrl}
        onChangeText={setApiBaseUrl}
        placeholder={t('settings.apiPlaceholder')}
        placeholderTextColor="#666"
        textAlign={isRTL ? 'right' : 'left'}
        accessibilityLabel={t('settings.apiPlaceholder')}
      />
      <TextInput
        style={styles.input}
        value={wsUrl}
        onChangeText={setWsUrl}
        placeholder={t('settings.wsPlaceholder')}
        placeholderTextColor="#666"
        textAlign={isRTL ? 'right' : 'left'}
        accessibilityLabel={t('settings.wsPlaceholder')}
      />
      <NeonButton title={t('settings.save')} onPress={handleSave} />
      {status && <Text style={[styles.status, directionStyle]}>{status}</Text>}
      <View style={styles.localeContainer}>
        <Text style={[styles.subheading, directionStyle]}>{t('settings.language')}</Text>
        <View style={styles.localeRow}>
        {availableLocales.map((code) => (
          <TouchableOpacity
            key={code}
            style={[styles.localeButton, code === locale && styles.localeButtonActive]}
            onPress={() => setLocale(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: code === locale }}
            accessibilityLabel={getLocaleLabel(code)}
          >
            <Text style={[styles.localeText, code === locale && styles.localeTextActive]}>{getLocaleLabel(code)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </View>
      <Text style={[styles.help, directionStyle]}>
        {t('settings.help')}
      </Text>
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
  subheading: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0a0d23',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,247,255,0.2)',
    marginBottom: 12,
  },
  status: {
    color: '#00f7ff',
    marginTop: 8,
  },
  localeContainer: {
    marginTop: 16,
  },
  localeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  localeButton: {
    borderWidth: 1,
    borderColor: '#2a324f',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  localeButtonActive: {
    borderColor: '#00f7ff',
    backgroundColor: 'rgba(0,247,255,0.1)',
  },
  localeText: {
    color: '#c1c6de',
  },
  localeTextActive: {
    color: '#00f7ff',
    fontWeight: '700',
  },
  help: {
    color: '#7c7f93',
    marginTop: 16,
  },
});
