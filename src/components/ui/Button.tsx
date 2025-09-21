import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native'

// Hardcoded constants to avoid import issues
const COLORS = {
  primary: '#004D40',
  secondary: '#44C76F',
  white: '#FFFFFF',
  destructive: '#DC2626',
  destructiveDark: '#991B1B',
  gray: {
    100: '#F3F4F6',
    300: '#D1D5DB',
    500: '#6B7280',
    900: '#374151',
  }
}

const SIZES = {
  borderRadius: 8,
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button]

    // Add size styles
    switch (size) {
      case 'sm':
        baseStyle.push(styles.buttonSm)
        break
      case 'lg':
        baseStyle.push(styles.buttonLg)
        break
      case 'icon':
        baseStyle.push(styles.buttonIcon)
        break
      default:
        baseStyle.push(styles.buttonDefault)
        break
    }

    // Add variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton)
        break
      case 'secondary':
        baseStyle.push(styles.secondaryButton)
        break
      case 'outline':
        baseStyle.push(styles.outlineButton)
        break
      case 'destructive':
        baseStyle.push(styles.destructiveButton)
        break
      case 'ghost':
        baseStyle.push(styles.ghostButton)
        break
      case 'link':
        baseStyle.push(styles.linkButton)
        break
    }

    if (fullWidth) {
      baseStyle.push(styles.fullWidth)
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabledButton)
    }

    return baseStyle
  }

  const getTextStyle = () => {
    const baseStyle = [styles.text]

    // Add size text styles
    switch (size) {
      case 'sm':
        baseStyle.push(styles.textSm)
        break
      case 'lg':
        baseStyle.push(styles.textLg)
        break
      case 'icon':
        baseStyle.push(styles.textIcon)
        break
      default:
        baseStyle.push(styles.textDefault)
        break
    }

    // Add variant text styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText)
        break
      case 'secondary':
        baseStyle.push(styles.secondaryText)
        break
      case 'outline':
        baseStyle.push(styles.outlineText)
        break
      case 'destructive':
        baseStyle.push(styles.destructiveText)
        break
      case 'ghost':
        baseStyle.push(styles.ghostText)
        break
      case 'link':
        baseStyle.push(styles.linkText)
        break
    }

    if (disabled || loading) {
      baseStyle.push(styles.disabledText)
    }

    return baseStyle
  }

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.white : COLORS.secondary}
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  fullWidth: {
    width: '100%',
  },

  // Size styles
  buttonDefault: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
  },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  buttonLg: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    minHeight: 52,
  },
  buttonIcon: {
    width: 44,
    height: 44,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  // Variant styles
  primaryButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.gray[100],
    borderColor: COLORS.gray[300],
    shadowColor: COLORS.gray[300],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
  },
  destructiveButton: {
    backgroundColor: COLORS.destructive,
    borderColor: COLORS.destructiveDark,
    shadowColor: COLORS.destructiveDark,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  linkButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButton: {
    opacity: 0.5,
  },

  // Base text styles
  text: {
    fontWeight: '900',
    textAlign: 'center',
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
  textIcon: {
    fontSize: 16,
  },

  // Text variant styles
  primaryText: {
    color: COLORS.primary,
  },
  secondaryText: {
    color: COLORS.gray[900],
  },
  outlineText: {
    color: COLORS.secondary,
  },
  destructiveText: {
    color: COLORS.white,
  },
  ghostText: {
    color: COLORS.gray[900],
  },
  linkText: {
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },
  disabledText: {
    opacity: 0.5,
  },
})