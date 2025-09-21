// components/ui/Badge.tsx - Mobile-native badge component
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'default' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'default',
  style,
  textStyle,
}) => {
  const badgeStyles = [
    styles.badge,
    styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`badgeSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    style,
  ];

  const textStyles = [
    styles.badgeText,
    styles[`badgeText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`badgeTextSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    textStyle,
  ];

  return (
    <View style={cn(...badgeStyles)}>
      <Text style={cn(...textStyles)}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Base badge styles
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },

  // Variant styles
  badgeDefault: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  badgeSecondary: {
    backgroundColor: '#F2F5F1',
    borderColor: '#E5E7EB',
  },
  badgeDestructive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  badgeOutline: {
    backgroundColor: 'transparent',
    borderColor: '#004D40',
  },
  badgeSuccess: {
    backgroundColor: '#44C76F',
    borderColor: '#44C76F',
  },
  badgeWarning: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },

  // Size styles
  badgeSizeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeSizeDefault: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeSizeLg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  // Base text styles
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Text variant styles
  badgeTextDefault: {
    color: 'white',
  },
  badgeTextSecondary: {
    color: '#374151',
  },
  badgeTextDestructive: {
    color: 'white',
  },
  badgeTextOutline: {
    color: '#004D40',
  },
  badgeTextSuccess: {
    color: 'white',
  },
  badgeTextWarning: {
    color: 'white',
  },

  // Text size styles
  badgeTextSizeSm: {
    fontSize: 10,
    fontWeight: '600',
  },
  badgeTextSizeDefault: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSizeLg: {
    fontSize: 14,
    fontWeight: '700',
  },
});

// Export default for convenience
export default Badge;