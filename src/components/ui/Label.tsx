// components/ui/Label.tsx - Mobile-native label/text component
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { cn } from '../../lib/utils';

export interface LabelProps {
  children: React.ReactNode;
  variant?: 'default' | 'heading' | 'subheading' | 'body' | 'caption' | 'small';
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'heavy';
  color?: 'default' | 'muted' | 'accent' | 'destructive' | 'success' | 'warning' | 'primary';
  align?: 'left' | 'center' | 'right' | 'justify';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline' | 'line-through';
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  selectable?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'text' | 'header' | 'link' | 'button';
}

export const Label: React.FC<LabelProps> = ({
  children,
  variant = 'default',
  size = 'default',
  weight = 'normal',
  color = 'default',
  align = 'left',
  transform = 'none',
  decoration = 'none',
  style,
  numberOfLines,
  ellipsizeMode = 'tail',
  selectable = false,
  accessible = true,
  accessibilityLabel,
  accessibilityRole = 'text',
  ...props
}) => {
  const labelStyles = [
    styles.label,
    styles[`labelVariant${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`labelSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`labelWeight${weight.charAt(0).toUpperCase() + weight.slice(1)}`],
    styles[`labelColor${color.charAt(0).toUpperCase() + color.slice(1)}`],
    styles[`labelAlign${align.charAt(0).toUpperCase() + align.slice(1)}`],
    styles[`labelTransform${transform.charAt(0).toUpperCase() + transform.slice(1)}`],
    styles[`labelDecoration${decoration.charAt(0).toUpperCase() + decoration.slice(1)}`],
    style,
  ];

  return (
    <Text
      style={cn(...labelStyles)}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      selectable={selectable}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </Text>
  );
};

// Preset label components for common use cases
export const Heading: React.FC<Omit<LabelProps, 'variant'>> = (props) => (
  <Label {...props} variant="heading" />
);

export const Subheading: React.FC<Omit<LabelProps, 'variant'>> = (props) => (
  <Label {...props} variant="subheading" />
);

export const Body: React.FC<Omit<LabelProps, 'variant'>> = (props) => (
  <Label {...props} variant="body" />
);

export const Caption: React.FC<Omit<LabelProps, 'variant'>> = (props) => (
  <Label {...props} variant="caption" />
);

export const Small: React.FC<Omit<LabelProps, 'variant'>> = (props) => (
  <Label {...props} variant="small" />
);

const styles = StyleSheet.create({
  // Base label styles
  label: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },

  // Variant styles
  labelVariantDefault: {
    fontSize: 16,
    lineHeight: 24,
  },
  labelVariantHeading: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  labelVariantSubheading: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  labelVariantBody: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  labelVariantCaption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelVariantSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },

  // Size styles
  labelSizeXs: {
    fontSize: 10,
    lineHeight: 14,
  },
  labelSizeSm: {
    fontSize: 12,
    lineHeight: 16,
  },
  labelSizeDefault: {
    fontSize: 16,
    lineHeight: 24,
  },
  labelSizeLg: {
    fontSize: 18,
    lineHeight: 26,
  },
  labelSizeXl: {
    fontSize: 20,
    lineHeight: 28,
  },
  labelSize2xl: {
    fontSize: 24,
    lineHeight: 32,
  },
  labelSize3xl: {
    fontSize: 30,
    lineHeight: 36,
  },

  // Weight styles
  labelWeightLight: {
    fontWeight: '300',
  },
  labelWeightNormal: {
    fontWeight: '400',
  },
  labelWeightMedium: {
    fontWeight: '500',
  },
  labelWeightSemibold: {
    fontWeight: '600',
  },
  labelWeightBold: {
    fontWeight: '700',
  },
  labelWeightHeavy: {
    fontWeight: '900',
  },

  // Color styles
  labelColorDefault: {
    color: '#374151',
  },
  labelColorMuted: {
    color: '#6B7280',
  },
  labelColorAccent: {
    color: '#44C76F',
  },
  labelColorDestructive: {
    color: '#EF4444',
  },
  labelColorSuccess: {
    color: '#10B981',
  },
  labelColorWarning: {
    color: '#F59E0B',
  },
  labelColorPrimary: {
    color: '#004D40',
  },

  // Alignment styles
  labelAlignLeft: {
    textAlign: 'left',
  },
  labelAlignCenter: {
    textAlign: 'center',
  },
  labelAlignRight: {
    textAlign: 'right',
  },
  labelAlignJustify: {
    textAlign: 'justify',
  },

  // Transform styles
  labelTransformNone: {
    textTransform: 'none',
  },
  labelTransformUppercase: {
    textTransform: 'uppercase',
  },
  labelTransformLowercase: {
    textTransform: 'lowercase',
  },
  labelTransformCapitalize: {
    textTransform: 'capitalize',
  },

  // Decoration styles
  labelDecorationNone: {
    textDecorationLine: 'none',
  },
  labelDecorationUnderline: {
    textDecorationLine: 'underline',
  },
  labelDecorationLineThrough: {
    textDecorationLine: 'line-through',
  },
});

// Export default for convenience
export default Label;