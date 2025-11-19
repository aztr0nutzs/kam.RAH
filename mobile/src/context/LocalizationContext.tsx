import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import {
  Locale,
  TranslationKey,
  defaultLocale,
  isLocaleRTL,
  localeDisplayNames,
  supportedLocales,
  translate,
} from '../i18n/translations';

const STORAGE_KEY = 'kamrah-mobile:locale';

interface LocalizationValue {
  locale: Locale;
  isRTL: boolean;
  setLocale: (next: Locale) => Promise<void>;
  availableLocales: Locale[];
  ready: boolean;
}

const LocalizationContext = createContext<LocalizationValue | undefined>(undefined);

const resolveDeviceLocale = (): Locale => {
  const deviceLocales = Localization.getLocales();
  const code = deviceLocales[0]?.languageCode?.toLowerCase();
  if (code && supportedLocales.includes(code as Locale)) {
    return code as Locale;
  }
  return defaultLocale;
};

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      const stored = (await AsyncStorage.getItem(STORAGE_KEY)) as Locale | null;
      const resolved = stored && supportedLocales.includes(stored) ? stored : resolveDeviceLocale();
      if (isMounted) {
        setLocaleState(resolved);
        setReady(true);
      }
    };
    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    I18nManager.allowRTL(true);
    if (I18nManager.isRTL !== isLocaleRTL(locale)) {
      I18nManager.forceRTL(isLocaleRTL(locale));
    }
  }, [locale]);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LocalizationValue>(
    () => ({
      locale,
      isRTL: isLocaleRTL(locale),
      setLocale,
      availableLocales: supportedLocales,
      ready,
    }),
    [locale, ready, setLocale]
  );

  if (!value.ready) {
    return null;
  }

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { locale } = useLocalization();
  const t = useCallback((key: TranslationKey, variables?: Record<string, string | number>) => translate(locale, key, variables), [
    locale,
  ]);
  return { t, locale };
};

export const getLocaleLabel = (locale: Locale) => localeDisplayNames[locale];
