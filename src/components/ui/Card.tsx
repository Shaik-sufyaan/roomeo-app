// components/ui/Card.tsx - Mobile-native card component (Type C)
import React from 'react';
import {
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
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    500: '#6B7280',
    600: '#4B5563',
    900: '#374151',
  }
}

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface CardActionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

// Main Card Component
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  disabled = false,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = styles.card;
    const variantStyle = getVariantStyle(variant);
    const disabledStyle = disabled ? styles.cardDisabled : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getVariantStyle = (variant: CardVariant): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return styles.cardElevated;
      case 'outlined':
        return styles.cardOutlined;
      case 'default':
      default:
        return styles.cardDefault;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()}>
      {children}
    </View>
  );
};

// Card Header Component
export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  );
};

// Card Title Component
export const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
  return (
    <Text style={[styles.cardTitle, style]}>
      {children}
    </Text>
  );
};

// Card Description Component
export const CardDescription: React.FC<CardDescriptionProps> = ({ children, style }) => {
  return (
    <Text style={[styles.cardDescription, style]}>
      {children}
    </Text>
  );
};

// Card Action Component
export const CardAction: React.FC<CardActionProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardAction, style]}>
      {children}
    </View>
  );
};

// Card Content Component
export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardContent, style]}>
      {children}
    </View>
  );
};

// Card Footer Component
export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return (
    <View style={[styles.cardFooter, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Base card styles
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },

  // Card variants
  cardDefault: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardElevated: {
    backgroundColor: COLORS.white,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
  },
  cardOutlined: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: COLORS.secondary,
    elevation: 4,
  },
  cardDisabled: {
    opacity: 0.6,
  },

  // Card sections
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.gray[900],
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[500],
    lineHeight: 20,
    marginTop: 4,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardContent: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
});