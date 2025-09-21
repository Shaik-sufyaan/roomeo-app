// components/ui/Input.tsx - Mobile-native input component (Type C)
import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';

// Hardcoded constants to avoid import issues
const COLORS = {
  primary: '#004D40',
  secondary: '#44C76F',
  white: '#FFFFFF',
  destructive: '#DC2626',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    900: '#374151',
  }
}

export type InputSize = 'default' | 'sm' | 'lg';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  size?: InputSize;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  showPasswordToggle?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  size = 'default',
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style,
  inputStyle,
  showPasswordToggle = false,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle = styles.container;
    const sizeStyle = getSizeStyle(size);
    const focusStyle = isFocused ? styles.containerFocused : {};
    const errorStyle = error ? styles.containerError : {};
    const disabledStyle = disabled ? styles.containerDisabled : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...focusStyle,
      ...errorStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle = styles.input;
    const sizeTextStyle = getSizeTextStyle(size);
    const disabledStyle = disabled ? styles.inputDisabled : {};
    const multilineStyle = multiline ? styles.inputMultiline : {};

    return {
      ...baseStyle,
      ...sizeTextStyle,
      ...disabledStyle,
      ...multilineStyle,
      ...inputStyle,
    };
  };

  const getSizeStyle = (size: InputSize): ViewStyle => {
    switch (size) {
      case 'sm':
        return styles.containerSm;
      case 'lg':
        return styles.containerLg;
      case 'default':
      default:
        return styles.containerDefault;
    }
  };

  const getSizeTextStyle = (size: InputSize): TextStyle => {
    switch (size) {
      case 'sm':
        return styles.textSm;
      case 'lg':
        return styles.textLg;
      case 'default':
      default:
        return styles.textDefault;
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.wrapper}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={getContainerStyle()}>
        <TextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          keyboardType={keyboardType}
          secureTextEntry={showPasswordToggle ? !isPasswordVisible : secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical={multiline ? 'top' : 'center'}
        />

        {/* Password Toggle */}
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
            disabled={disabled}
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? '👁️' : '🔒'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Character Count */}
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Wrapper styles
  wrapper: {
    marginBottom: 4,
  },

  // Label styles
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 6,
  },
  required: {
    color: COLORS.destructive,
  },

  // Container styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 2,
  },
  containerDefault: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
  containerSm: {
    minHeight: 36,
    paddingHorizontal: 10,
  },
  containerLg: {
    minHeight: 52,
    paddingHorizontal: 16,
  },
  containerFocused: {
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
  },
  containerError: {
    borderColor: COLORS.destructive,
    shadowColor: COLORS.destructive,
  },
  containerDisabled: {
    backgroundColor: COLORS.gray[100],
    opacity: 0.6,
  },

  // Input styles
  input: {
    flex: 1,
    fontWeight: '600',
    color: COLORS.gray[900],
    padding: 0,
  },
  inputMultiline: {
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: COLORS.gray[500],
  },

  // Text size styles
  textDefault: {
    fontSize: 16,
  },
  textSm: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 18,
  },

  // Password toggle
  passwordToggle: {
    padding: 8,
    marginLeft: 4,
  },
  passwordToggleText: {
    fontSize: 16,
  },

  // Error and helper text
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.destructive,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[500],
    textAlign: 'right',
    marginTop: 2,
  },
});