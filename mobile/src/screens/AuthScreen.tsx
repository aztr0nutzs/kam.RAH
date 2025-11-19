import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useLocalization, useTranslation } from '../context/LocalizationContext';
import type { TranslationKey } from '../i18n/translations';

const MIN_PASSWORD_LENGTH = 12;
type PasswordCheck = { key: TranslationKey; test: (value: string) => boolean };

const passwordChecks: PasswordCheck[] = [
  { key: 'auth.requirement.uppercase', test: (value) => /[A-Z]/.test(value) },
  { key: 'auth.requirement.lowercase', test: (value) => /[a-z]/.test(value) },
  { key: 'auth.requirement.number', test: (value) => /\d/.test(value) },
  { key: 'auth.requirement.symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { isRTL } = useLocalization();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const directionStyle = useMemo(() => ({ writingDirection: (isRTL ? 'rtl' : 'ltr') as 'ltr' | 'rtl', textAlign: (isRTL ? 'right' : 'left') as 'left' | 'right' }), [
    isRTL,
  ]);

  useEffect(() => {
    if (formErrors.length > 0) {
      AccessibilityInfo.announceForAccessibility(formErrors.join('. '));
    }
  }, [formErrors]);

  useEffect(() => {
    if (error) {
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error]);

  useEffect(() => {
    setError(null);
  }, [email, password]);

  const passwordRequirements = useMemo(() => {
    if (mode !== 'register') {
      return [];
    }
    const issues: string[] = [];
    if (password.length < MIN_PASSWORD_LENGTH) {
      issues.push(t('auth.requirement.length', { length: MIN_PASSWORD_LENGTH }));
    }
    passwordChecks.forEach((rule) => {
      if (!rule.test(password)) {
        issues.push(t(rule.key as any));
      }
    });
    return issues;
  }, [mode, password, t]);

  const validateInputs = () => {
    const nextErrors: string[] = [];
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.push(t('auth.validation.email'));
    }
    if (!password) {
      nextErrors.push(t('auth.validation.passwordEmpty'));
    }
    if (mode === 'register') {
      if (!name.trim()) {
        nextErrors.push(t('auth.validation.codename'));
      }
      if (passwordRequirements.length > 0) {
        nextErrors.push(t('auth.validation.passwordRequirements', { rules: passwordRequirements.join(', ') }));
      }
    }
    setFormErrors(nextErrors);
    return nextErrors.length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    try {
      if (!validateInputs()) {
        return;
      }
      if (mode === 'login') {
        await login(trimmedEmail, password);
      } else {
        await register(trimmedName, trimmedEmail, password);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.error.generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#020202', '#050218']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.card}>
        <Text style={[styles.title, directionStyle]}>{t('auth.title')}</Text>
        <Text style={[styles.subtitle, directionStyle]}>{t('auth.subtitle')}</Text>

        {mode === 'register' && (
          <View style={styles.field}>
            <Text style={[styles.label, directionStyle]}>{t('auth.codenameLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.codenamePlaceholder')}
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              textAlign={isRTL ? 'right' : 'left'}
              accessibilityLabel={t('auth.codenameLabel')}
            />
          </View>
        )}

        <View style={styles.field}>
          <Text style={[styles.label, directionStyle]}>{t('auth.emailLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            textAlign={isRTL ? 'right' : 'left'}
            accessibilityLabel={t('auth.emailLabel')}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, directionStyle]}>{t('auth.passwordLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textAlign={isRTL ? 'right' : 'left'}
            accessibilityLabel={t('auth.passwordLabel')}
          />
        </View>

        {formErrors.length > 0 && (
          <View style={styles.errorBox} accessibilityRole="alert">
            {formErrors.map((issue) => (
              <Text key={issue} style={styles.error}>
                • {issue}
              </Text>
            ))}
          </View>
        )}
        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading} accessibilityRole="button">
          <Text style={styles.buttonText}>
            {loading ? t('auth.loading') : mode === 'login' ? t('auth.login') : t('auth.register')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
          accessibilityRole="button"
        >
          <Text style={[styles.switch, directionStyle]}>
            {mode === 'login' ? t('auth.toggle.toRegister') : t('auth.toggle.toLogin')}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(5,5,20,0.9)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,247,255,0.3)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00f7ff',
    textAlign: 'center',
  },
  subtitle: {
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 16,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: '#aaa',
    marginBottom: 4,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#0a0a16',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,247,255,0.2)',
  },
  button: {
    backgroundColor: '#00f7ff',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: '700',
  },
  switch: {
    color: '#00f7ff',
    textAlign: 'center',
    marginTop: 12,
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 8,
  },
  errorBox: {
    marginBottom: 8,
  },
});
