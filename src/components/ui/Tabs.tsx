// components/ui/Tabs.tsx - Mobile-native tab navigation component
import React, { useState, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { cn } from '../../lib/utils';

// Context for managing tab state
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: 'default' | 'pills' | 'underline';
  size: 'sm' | 'default' | 'lg';
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

// Main Tabs container
export interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'default' | 'lg';
  style?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  size = 'default',
  style,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || '');

  const activeTab = value !== undefined ? value : internalActiveTab;

  const setActiveTab = (newValue: string) => {
    if (value === undefined) {
      setInternalActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{
        activeTab,
        setActiveTab,
        variant,
        size,
      }}
    >
      <View style={[styles.container, style]}>
        {children}
      </View>
    </TabsContext.Provider>
  );
};

// Tab List component
export interface TabsListProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

export const TabsList: React.FC<TabsListProps> = ({
  children,
  style,
  scrollable = false,
}) => {
  const { variant } = useTabsContext();

  const listStyles = [
    styles.tabsList,
    styles[`tabsList${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={cn(...listStyles)}
        contentContainerStyle={styles.scrollableContent}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={cn(...listStyles)}>
      {children}
    </View>
  );
};

// Individual Tab Trigger
export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  disabled = false,
  style,
  textStyle,
}) => {
  const { activeTab, setActiveTab, variant, size } = useTabsContext();
  const isActive = activeTab === value;

  const triggerStyles = [
    styles.tabsTrigger,
    styles[`tabsTrigger${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`tabsTriggerSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    isActive && styles[`tabsTriggerActive${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.tabsTriggerDisabled,
    style,
  ];

  const triggerTextStyles = [
    styles.tabsTriggerText,
    styles[`tabsTriggerTextSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    isActive && styles[`tabsTriggerTextActive${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    disabled && styles.tabsTriggerTextDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={cn(...triggerStyles)}
      onPress={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={cn(...triggerTextStyles)}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

// Tab Content
export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  style,
}) => {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <View style={[styles.tabsContent, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  // Tabs List styles
  tabsList: {
    flexDirection: 'row',
  },
  tabsListDefault: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tabsListPills: {
    backgroundColor: 'transparent',
    gap: 8,
  },
  tabsListUnderline: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  scrollableContent: {
    paddingHorizontal: 16,
  },

  // Tabs Trigger base styles
  tabsTrigger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },

  // Trigger variants
  tabsTriggerDefault: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabsTriggerPills: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabsTriggerUnderline: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    borderRadius: 0,
  },

  // Trigger sizes
  tabsTriggerSizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tabsTriggerSizeDefault: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabsTriggerSizeLg: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Active trigger states
  tabsTriggerActiveDefault: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabsTriggerActivePills: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  tabsTriggerActiveUnderline: {
    borderBottomColor: '#004D40',
  },

  // Disabled trigger
  tabsTriggerDisabled: {
    opacity: 0.5,
  },

  // Trigger text styles
  tabsTriggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  tabsTriggerTextSizeSm: {
    fontSize: 12,
  },
  tabsTriggerTextSizeDefault: {
    fontSize: 14,
  },
  tabsTriggerTextSizeLg: {
    fontSize: 16,
  },

  // Active text states
  tabsTriggerTextActiveDefault: {
    color: '#004D40',
  },
  tabsTriggerTextActivePills: {
    color: 'white',
  },
  tabsTriggerTextActiveUnderline: {
    color: '#004D40',
  },

  // Disabled text
  tabsTriggerTextDisabled: {
    color: '#D1D5DB',
  },

  // Content styles
  tabsContent: {
    flex: 1,
    paddingTop: 16,
  },
});

// Export all components as named exports
export { Tabs as default };

// Compound component pattern
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;