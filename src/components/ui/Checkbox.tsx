// components/ui/Checkbox.tsx - Mobile-native checkbox component
import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { cn } from '../../lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  position?: 'left' | 'right';
  style?: ViewStyle;
  checkboxStyle?: ViewStyle;
  labelStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  name?: string;
  value?: string;
  accessibilityLabel?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  label,
  description,
  variant = 'default',
  size = 'default',
  color = 'primary',
  position = 'left',
  style,
  checkboxStyle,
  labelStyle,
  descriptionStyle,
  error = false,
  errorMessage,
  required = false,
  name,
  value,
  accessibilityLabel,
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [scaleAnim] = useState(new Animated.Value(1));

  const isChecked = checked !== undefined ? checked : internalChecked;

  const handlePress = () => {
    if (disabled) return;

    // Animate the press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const newChecked = !isChecked;

    if (checked === undefined) {
      setInternalChecked(newChecked);
    }

    onCheckedChange?.(newChecked);
  };

  const containerStyles = [styles.container, style];

  const checkboxStyles = [
    styles.checkbox,
    styles[`checkbox${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`checkboxSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`checkboxColor${color.charAt(0).toUpperCase() + color.slice(1)}`],
    isChecked && styles[`checkboxChecked${color.charAt(0).toUpperCase() + color.slice(1)}`],
    disabled && styles.checkboxDisabled,
    error && styles.checkboxError,
    checkboxStyle,
  ];

  const labelStyles = [
    styles.label,
    styles[`labelSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.labelDisabled,
    error && styles.labelError,
    labelStyle,
  ];

  const descriptionStyles = [
    styles.description,
    styles[`descriptionSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.descriptionDisabled,
    descriptionStyle,
  ];

  const checkmarkStyles = [
    styles.checkmark,
    styles[`checkmarkSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
  ];

  const renderCheckbox = () => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={cn(...checkboxStyles)}>
        {isChecked && (
          <Text style={cn(...checkmarkStyles)}>✓</Text>
        )}
      </View>
    </Animated.View>
  );

  const renderLabel = () => (
    <View style={styles.labelContainer}>
      <Text style={cn(...labelStyles)}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      {description && (
        <Text style={cn(...descriptionStyles)}>{description}</Text>
      )}
    </View>
  );

  return (
    <View style={cn(...containerStyles)}>
      <TouchableOpacity
        style={[
          styles.touchable,
          position === 'right' && styles.touchableReverse,
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        accessible
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked, disabled }}
        accessibilityLabel={accessibilityLabel || label}
      >
        {position === 'left' && renderCheckbox()}
        {(label || description) && renderLabel()}
        {position === 'right' && renderCheckbox()}
      </TouchableOpacity>

      {error && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
};

// Preset checkbox components
export const CheckboxWithLabel: React.FC<CheckboxProps & { children: React.ReactNode }> = ({
  children,
  ...props
}) => <Checkbox {...props} label={children as string} />;

export const SmallCheckbox: React.FC<Omit<CheckboxProps, 'size'>> = (props) => (
  <Checkbox {...props} size="sm" />
);

export const LargeCheckbox: React.FC<Omit<CheckboxProps, 'size'>> = (props) => (
  <Checkbox {...props} size="lg" />
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  touchable: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  touchableReverse: {
    flexDirection: 'row-reverse',
  },

  // Base checkbox styles
  checkbox: {
    borderRadius: 4,
    borderWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Checkbox variants
  checkboxDefault: {
    borderColor: '#D1D5DB',
  },
  checkboxOutline: {
    borderColor: '#374151',
    backgroundColor: 'transparent',
  },
  checkboxGhost: {
    borderColor: 'transparent',
    backgroundColor: '#F3F4F6',
  },

  // Checkbox sizes
  checkboxSizeSm: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  checkboxSizeDefault: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  checkboxSizeLg: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },

  // Checkbox colors (unchecked state)
  checkboxColorPrimary: {
    borderColor: '#004D40',
  },
  checkboxColorSecondary: {
    borderColor: '#6B7280',
  },
  checkboxColorSuccess: {
    borderColor: '#10B981',
  },
  checkboxColorWarning: {
    borderColor: '#F59E0B',
  },
  checkboxColorDestructive: {
    borderColor: '#EF4444',
  },

  // Checkbox checked states
  checkboxCheckedPrimary: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  checkboxCheckedSecondary: {
    backgroundColor: '#6B7280',
    borderColor: '#6B7280',
  },
  checkboxCheckedSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxCheckedWarning: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  checkboxCheckedDestructive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },

  // Checkbox states
  checkboxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  checkboxError: {
    borderColor: '#EF4444',
  },

  // Checkmark styles
  checkmark: {
    color: 'white',
    fontWeight: '700',
  },
  checkmarkSizeSm: {
    fontSize: 10,
  },
  checkmarkSizeDefault: {
    fontSize: 12,
  },
  checkmarkSizeLg: {
    fontSize: 16,
  },

  // Label container
  labelContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Label styles
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
  },
  labelSizeSm: {
    fontSize: 14,
    lineHeight: 18,
  },
  labelSizeDefault: {
    fontSize: 16,
    lineHeight: 20,
  },
  labelSizeLg: {
    fontSize: 18,
    lineHeight: 24,
  },
  labelDisabled: {
    color: '#9CA3AF',
  },
  labelError: {
    color: '#EF4444',
  },

  // Required asterisk
  required: {
    color: '#EF4444',
    fontWeight: '600',
  },

  // Description styles
  description: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 18,
    marginTop: 2,
  },
  descriptionSizeSm: {
    fontSize: 12,
    lineHeight: 16,
  },
  descriptionSizeDefault: {
    fontSize: 14,
    lineHeight: 18,
  },
  descriptionSizeLg: {
    fontSize: 16,
    lineHeight: 20,
  },
  descriptionDisabled: {
    color: '#D1D5DB',
  },

  // Error text
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
});

// Export default for convenience
export default Checkbox;