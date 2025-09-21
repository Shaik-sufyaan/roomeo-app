// components/ui/ErrorBoundary.tsx - React Native error boundary component
import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { logMobileError } from '../../lib/debug';

const { width, height } = Dimensions.get('window');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  enableReporting?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableReporting = true } = this.props;

    this.setState({ errorInfo });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Custom error handler
    onError?.(error, errorInfo);

    // Report error using mobile error logging
    if (enableReporting) {
      logMobileError('ErrorBoundary', error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId: this.state.errorId,
      });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when specified props change
    if (hasError && resetOnPropsChange && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, idx) =>
        prevProps.resetKeys?.[idx] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    // Clear any existing timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleReload = () => {
    Alert.alert(
      'Reload App',
      'This will restart the app to recover from the error.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reload',
          style: 'default',
          onPress: () => {
            // In React Native, we can't reload like in web
            // Instead, reset the error boundary and hope for the best
            this.resetErrorBoundary();

            // You could implement app restart logic here if needed
            // For example, using react-native-restart package
          },
        },
      ]
    );
  };

  handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;

    Alert.alert(
      'Report Bug',
      'Would you like to report this error to help improve the app?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'default',
          onPress: () => {
            // Here you could implement bug reporting
            // For example, send to a crash reporting service
            console.log('Bug report:', { error, errorInfo, errorId });

            Alert.alert(
              'Thank You',
              'Your bug report has been submitted. We\'ll work on fixing this issue.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  renderErrorDetails = () => {
    const { showErrorDetails = __DEV__ } = this.props;
    const { error, errorInfo } = this.state;

    if (!showErrorDetails || !error) {
      return null;
    }

    return (
      <ScrollView style={styles.errorDetails} showsVerticalScrollIndicator={false}>
        <Text style={styles.errorDetailsTitle}>Error Details (Development Only)</Text>

        <View style={styles.errorSection}>
          <Text style={styles.errorSectionTitle}>Error Message:</Text>
          <Text style={styles.errorText}>{error.message}</Text>
        </View>

        <View style={styles.errorSection}>
          <Text style={styles.errorSectionTitle}>Stack Trace:</Text>
          <Text style={styles.errorText}>{error.stack}</Text>
        </View>

        {errorInfo && (
          <View style={styles.errorSection}>
            <Text style={styles.errorSectionTitle}>Component Stack:</Text>
            <Text style={styles.errorText}>{errorInfo.componentStack}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  renderFallback = () => {
    const { fallback } = this.props;
    const { error } = this.state;

    if (fallback) {
      return fallback;
    }

    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          {/* Error Icon */}
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>⚠️</Text>
          </View>

          {/* Error Message */}
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorSubtitle}>
            The app encountered an unexpected error. Don't worry, it's not your fault!
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={this.handleRetry}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={this.handleReload}
            >
              <Text style={styles.secondaryButtonText}>Reload App</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Actions */}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={this.handleReportBug}
          >
            <Text style={styles.reportButtonText}>Report this issue</Text>
          </TouchableOpacity>

          {/* Error Details */}
          {this.renderErrorDetails()}
        </View>
      </View>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

// Hook-based wrapper for functional components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

// Simple error boundary for quick wrapping
export const SimpleErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
);

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  errorIconText: {
    fontSize: 32,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  actionButtons: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },

  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButton: {
    backgroundColor: '#44C76F',
    borderWidth: 2,
    borderColor: '#004D40',
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },

  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },

  reportButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  reportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },

  // Error details styles (development only)
  errorDetails: {
    marginTop: 20,
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },

  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },

  errorSection: {
    marginBottom: 12,
  },

  errorSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },

  errorText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#374151',
    lineHeight: 16,
  },
});

// Export default for convenience
export default ErrorBoundary;