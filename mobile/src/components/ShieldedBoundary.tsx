import React from 'react';
import type { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { captureError, logInfo } from '../utils/logger';

type ShieldedBoundaryProps = {
  children: ReactNode;
};

type ShieldedBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ShieldedBoundary extends React.Component<ShieldedBoundaryProps, ShieldedBoundaryState> {
  state: ShieldedBoundaryState = {
    hasError: false,
    message: undefined,
  };

  static getDerivedStateFromError(error: Error): ShieldedBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureError(error, 'ShieldedBoundary', { componentStack: errorInfo.componentStack });
  }

  private handleReset = () => {
    logInfo('Resetting ShieldedBoundary after fault');
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Signal Lost</Text>
          <Text style={styles.subtitle}>
            {this.state.message ?? 'An unexpected error disrupted the control link.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Reset Interface</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#050218',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00f7ff',
    marginBottom: 12,
  },
  subtitle: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#00f7ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
  },
});
