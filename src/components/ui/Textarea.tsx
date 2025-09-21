// components/ui/Textarea.tsx - Mobile-native multiline TextInput component
import React, { forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { cn } from '../../lib/utils';

export interface TextareaProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  rows?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Textarea = forwardRef<TextInput, TextareaProps>(
  (
    {
      label,
      error = false,
      errorMessage,
      helperText,
      variant = 'outline',
      size = 'default',
      resize = 'vertical',
      rows = 4,
      placeholder = 'Enter text...',
      containerStyle,
      inputStyle,
      labelStyle,
      ...props
    },
    ref
  ) => {
    const containerStyles = [styles.container, containerStyle];

    const inputStyles = [
      styles.input,
      styles[`input${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
      styles[`inputSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
      error && styles.inputError,
      props.editable === false && styles.inputDisabled,
      inputStyle,
    ];

    const labelStyles = [
      styles.label,
      styles[`labelSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
      error && styles.labelError,
      labelStyle,
    ];

    // Calculate height based on rows and size
    const getInputHeight = () => {
      const baseHeight = size === 'sm' ? 20 : size === 'lg' ? 24 : 22;
      const padding = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
      return baseHeight * rows + padding;
    };

    return (
      <View style={cn(...containerStyles)}>
        {label && (
          <Text style={cn(...labelStyles)}>{label}</Text>
        )}

        <TextInput
          ref={ref}
          style={[
            cn(...inputStyles),
            { height: getInputHeight(), textAlignVertical: 'top' },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={rows}
          textAlignVertical="top"
          {...props}
        />

        {(error && errorMessage) && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        {(!error && helperText) && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>
    );
  }
);

Textarea.displayName = 'Textarea';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  // Label styles
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  labelSizeSm: {
    fontSize: 12,
    marginBottom: 4,
  },
  labelSizeDefault: {
    fontSize: 14,
    marginBottom: 6,
  },
  labelSizeLg: {
    fontSize: 16,
    marginBottom: 8,
  },
  labelError: {
    color: '#EF4444',
  },

  // Base input styles
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    backgroundColor: 'white',
    borderWidth: 2,
  },

  // Input variants
  inputDefault: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  inputFilled: {
    backgroundColor: '#F3F4F6',
    borderColor: 'transparent',
  },
  inputOutline: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
  },

  // Input sizes
  inputSizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputSizeDefault: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputSizeLg: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
  },

  // Input states
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    color: '#9CA3AF',
  },

  // Helper text styles
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '400',
  },
});

// Export default for convenience
export default Textarea;