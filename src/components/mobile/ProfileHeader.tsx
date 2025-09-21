// components/mobile/ProfileHeader.tsx - Mobile-native header component
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import type { User } from '../../types/user';

interface ProfileHeaderProps {
  user: User;
  onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleProfilePress = () => {
    setShowMenu(true);
  };

  const menuItems = [
    {
      title: 'View Profile',
      onPress: () => {
        setShowMenu(false);
        // Navigate to profile view
      },
    },
    {
      title: 'Edit Profile',
      onPress: () => {
        setShowMenu(false);
        // Navigate to profile edit
      },
    },
    {
      title: 'Settings',
      onPress: () => {
        setShowMenu(false);
        // Navigate to settings
      },
    },
    {
      title: 'Help',
      onPress: () => {
        setShowMenu(false);
        // Show help
      },
    },
    {
      title: 'Sign Out',
      onPress: () => {
        setShowMenu(false);
        onLogout();
      },
      destructive: true,
    },
  ];

  return (
    <View style={styles.header}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoText}>R</Text>
        </View>
        <Text style={styles.logoTitle}>ROOMEO</Text>
      </View>

      {/* Profile Picture */}
      <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
        <Image
          source={{
            uri: user.profilePicture || 'https://via.placeholder.com/40x40/44C76F/004D40?text=U',
          }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Profile Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>

            {/* Menu Items */}
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  item.destructive && styles.destructiveMenuItem,
                ]}
                onPress={item.onPress}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    item.destructive && styles.destructiveMenuItemText,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F5F1',
    borderBottomWidth: 4,
    borderBottomColor: '#004D40',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#44C76F',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#004D40',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    transform: [{ rotate: '-3deg' }],
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    transform: [{ skewX: '-6deg' }],
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#44C76F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  menuContainer: {
    backgroundColor: '#F2F5F1',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#004D40',
    marginLeft: 'auto',
    marginRight: 0,
    minWidth: 200,
    shadowColor: '#004D40',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  userInfo: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#004D40',
  },
  userName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#004D40',
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '600',
    color: '#44C76F',
    marginTop: 2,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
  },
  destructiveMenuItem: {
    borderTopWidth: 2,
    borderTopColor: '#004D40',
  },
  destructiveMenuItemText: {
    color: '#DC2626',
  },
});