// components/mobile/TabNavigation.tsx - Mobile-native bottom tab navigation
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type TabType = 'swipe' | 'matches' | 'chat' | 'expenses' | 'marketplace' | 'profile';

interface Tab {
  key: TabType;
  label: string;
  shortLabel: string;
  icon: string;
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
  userType?: string | null;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabPress,
  userType,
}) => {
  const allTabs: Tab[] = [
    { key: 'swipe', label: 'DISCOVER', shortLabel: 'SWIPE', icon: '🔥' },
    { key: 'matches', label: 'MATCHES', shortLabel: 'MATCH', icon: '💕' },
    { key: 'chat', label: 'CHAT', shortLabel: 'CHAT', icon: '💬' },
    { key: 'expenses', label: 'EXPENSES', shortLabel: 'BILLS', icon: '💸' },
    { key: 'marketplace', label: 'MARKETPLACE', shortLabel: 'SHOP', icon: '🛍️' },
    { key: 'profile', label: 'PROFILE', shortLabel: 'ME', icon: '👤' },
  ];

  // Filter tabs based on user type
  const tabs = userType === 'quick_access'
    ? allTabs.filter(tab => tab.key !== 'matches')
    : allTabs;

  const tabWidth = width / tabs.length;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            { width: tabWidth },
            activeTab === tab.key && styles.activeTab,
          ]}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text
            style={[
              styles.label,
              activeTab === tab.key && styles.activeLabel,
            ]}
            numberOfLines={1}
          >
            {width > 400 ? tab.label : tab.shortLabel}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F5F1',
    borderTopWidth: 4,
    borderTopColor: '#004D40',
    paddingBottom: 8, // Account for safe area
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  activeTab: {
    backgroundColor: 'rgba(68, 199, 111, 0.2)',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  icon: {
    fontSize: 16,
    marginBottom: 2,
  },
  label: {
    fontSize: 8,
    fontWeight: '900',
    color: '#004D40',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#004D40',
  },
});