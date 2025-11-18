import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../context/LocalizationContext';

type Slide = {
  id: string;
  title: string;
  description: string;
  badge: string;
};

interface OnboardingCarouselProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({ visible, onComplete }) => {
  const { t } = useTranslation();
  const slides = useMemo<Slide[]>(
    () => [
      {
        id: 'grid-control',
        title: t('onboarding.slide1.title'),
        badge: t('onboarding.slide1.badge'),
        description: t('onboarding.slide1.body'),
      },
      {
        id: 'secure-sync',
        title: t('onboarding.slide2.title'),
        badge: t('onboarding.slide2.badge'),
        description: t('onboarding.slide2.body'),
      },
      {
        id: 'assist',
        title: t('onboarding.slide3.title'),
        badge: t('onboarding.slide3.badge'),
        description: t('onboarding.slide3.body'),
      },
    ],
    [t]
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      AccessibilityInfo.announceForAccessibility(t('onboarding.accessibility.complete'));
      onComplete();
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      AccessibilityInfo.announceForAccessibility(slides[nextIndex].title);
    }
  };

  const handleSkip = () => {
    AccessibilityInfo.announceForAccessibility(t('onboarding.accessibility.skip'));
    onComplete();
  };

  if (!visible) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const progress = ((currentIndex + 1) / slides.length) * 100;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleSkip} accessibilityViewIsModal>
      <LinearGradient colors={['rgba(2,2,8,0.9)', 'rgba(4,7,18,0.95)']} style={styles.backdrop}>
        <View
          style={styles.card}
          accessible
          accessibilityRole="summary"
          accessibilityLabel={`Onboarding slide ${currentIndex + 1} of ${slides.length}. ${currentSlide.title}`}
        >
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>{currentSlide.badge}</Text>
          </View>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
              onPress={handleSkip}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.skip')}
            >
              <Text style={styles.linkText}>{t('onboarding.skip')}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={currentIndex === slides.length - 1 ? t('onboarding.done') : t('onboarding.next')}
            >
              <Text style={styles.primaryText}>
                {currentIndex === slides.length - 1 ? t('onboarding.done') : t('onboarding.next')}
              </Text>
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    padding: 24,
    backgroundColor: 'rgba(5,8,20,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0,247,255,0.3)',
  },
  badgeContainer: {
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: '#142e38',
    color: '#78f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
  },
  description: {
    color: '#b6c6f5',
    lineHeight: 20,
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1e223d',
    marginTop: 24,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#00f7ff',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkText: {
    color: '#c6d6ff',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#00f7ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryText: {
    color: '#03131f',
    fontWeight: '700',
    fontSize: 16,
  },
});
