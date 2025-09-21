// components/ui/Separator.tsx - Mobile-native separator component
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { cn } from '../../lib/utils';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'dashed' | 'dotted' | 'thick';
  color?: string;
  style?: ViewStyle;
  decorative?: boolean;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  variant = 'default',
  color,
  style,
  decorative = true,
}) => {
  const separatorStyles = [
    styles.separator,
    styles[`separator${orientation.charAt(0).toUpperCase() + orientation.slice(1)}`],
    styles[`separator${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    color && { backgroundColor: color },
    style,
  ];

  return (
    <View
      style={cn(...separatorStyles)}
      accessible={!decorative}
      accessibilityRole={decorative ? 'none' : 'separator'}
    />
  );
};

// Preset separator components for common use cases
export const HorizontalSeparator: React.FC<Omit<SeparatorProps, 'orientation'>> = (props) => (
  <Separator {...props} orientation="horizontal" />
);

export const VerticalSeparator: React.FC<Omit<SeparatorProps, 'orientation'>> = (props) => (
  <Separator {...props} orientation="vertical" />
);

export const DashedSeparator: React.FC<Omit<SeparatorProps, 'variant'>> = (props) => (
  <Separator {...props} variant="dashed" />
);

export const DottedSeparator: React.FC<Omit<SeparatorProps, 'variant'>> = (props) => (
  <Separator {...props} variant="dotted" />
);

export const ThickSeparator: React.FC<Omit<SeparatorProps, 'variant'>> = (props) => (
  <Separator {...props} variant="thick" />
);

const styles = StyleSheet.create({
  // Base separator styles
  separator: {
    backgroundColor: '#E5E7EB',
  },

  // Orientation styles
  separatorHorizontal: {
    height: 1,
    width: '100%',
  },
  separatorVertical: {
    width: 1,
    height: '100%',
  },

  // Variant styles
  separatorDefault: {
    backgroundColor: '#E5E7EB',
  },
  separatorDashed: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
  },
  separatorDotted: {
    backgroundColor: 'transparent',
    borderStyle: 'dotted',
    borderColor: '#E5E7EB',
  },
  separatorThick: {
    backgroundColor: '#D1D5DB',
  },
});

// Update dashed and dotted styles to work with orientation
StyleSheet.create({
  ...styles,
  separatorDashed: {
    ...styles.separatorDashed,
    borderTopWidth: 1, // Will be overridden for vertical
  },
  separatorDotted: {
    ...styles.separatorDotted,
    borderTopWidth: 1, // Will be overridden for vertical
  },
});

// Add specific styles for dashed/dotted with orientations
const orientationVariantStyles = StyleSheet.create({
  // Horizontal dashed/dotted
  separatorHorizontalDashed: {
    borderTopWidth: 1,
    borderRightWidth: 0,
    height: 0,
  },
  separatorHorizontalDotted: {
    borderTopWidth: 1,
    borderRightWidth: 0,
    height: 0,
  },

  // Vertical dashed/dotted
  separatorVerticalDashed: {
    borderRightWidth: 1,
    borderTopWidth: 0,
    width: 0,
  },
  separatorVerticalDotted: {
    borderRightWidth: 1,
    borderTopWidth: 0,
    width: 0,
  },

  // Thick variants
  separatorHorizontalThick: {
    height: 2,
  },
  separatorVerticalThick: {
    width: 2,
  },
});

// Merge the additional styles
Object.assign(styles, orientationVariantStyles);

// Update the Separator component to handle complex variants
export const SeparatorEnhanced: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  variant = 'default',
  color,
  style,
  decorative = true,
}) => {
  const isHorizontal = orientation === 'horizontal';
  const isDashed = variant === 'dashed';
  const isDotted = variant === 'dotted';
  const isThick = variant === 'thick';

  let separatorStyles: any[] = [styles.separator];

  // Handle dashed and dotted variants with proper orientation
  if (isDashed || isDotted) {
    separatorStyles.push(
      styles[`separator${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
      styles[`separator${orientation.charAt(0).toUpperCase() + orientation.slice(1)}${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
    );
  } else {
    // Handle normal variants
    separatorStyles.push(
      styles[`separator${orientation.charAt(0).toUpperCase() + orientation.slice(1)}`],
      styles[`separator${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
    );
  }

  // Handle thick variant
  if (isThick) {
    separatorStyles.push(
      styles[`separator${orientation.charAt(0).toUpperCase() + orientation.slice(1)}Thick`]
    );
  }

  // Apply custom color
  if (color) {
    if (isDashed || isDotted) {
      separatorStyles.push({ borderColor: color });
    } else {
      separatorStyles.push({ backgroundColor: color });
    }
  }

  // Apply custom style
  if (style) {
    separatorStyles.push(style);
  }

  return (
    <View
      style={cn(...separatorStyles)}
      accessible={!decorative}
      accessibilityRole={decorative ? 'none' : 'separator'}
    />
  );
};

// Export default for convenience
export default Separator;