// components/mobile/ProfileEditScreen.tsx - Profile editing screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { User } from '../../types/user';

interface ProfileEditScreenProps {
  user: User;
  onSave: (updatedUser: Partial<User>) => Promise<void>;
  onBack: () => void;
  onChangePhoto: () => void;
}

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({
  user,
  onSave,
  onBack,
  onChangePhoto,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.bio || '',
    age: user.age?.toString() || '',
    location: user.location || '',
    budget: user.budget?.toString() || '',
    userType: user.userType || 'seeker',
    profileVisible: user.profileVisible ?? true,
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 18 || Number(formData.age) > 100)) {
      Alert.alert('Error', 'Please enter a valid age between 18 and 100');
      return;
    }

    if (formData.budget && isNaN(Number(formData.budget))) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    setIsLoading(true);
    try {
      const updatedData: Partial<User> = {
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        age: formData.age ? Number(formData.age) : undefined,
        location: formData.location.trim(),
        budget: formData.budget ? Number(formData.budget) : undefined,
        userType: formData.userType as 'seeker' | 'provider',
        profileVisible: formData.profileVisible,
      };

      await onSave(updatedData);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={onBack}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={[styles.headerButtonText, styles.saveButtonText]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Photo Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Photo</Text>
            <View style={styles.photoContainer}>
              <Image
                source={{
                  uri: user.profilePicture || 'https://via.placeholder.com/120x120/44C76F/004D40?text=U',
                }}
                style={styles.profilePhoto}
              />
              <TouchableOpacity style={styles.changePhotoButton} onPress={onChangePhoto}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={formData.age}
                onChangeText={(text) => updateFormData('age', text)}
                placeholder="Enter your age"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => updateFormData('location', text)}
                placeholder="Enter your location"
                placeholderTextColor="#9CA3AF"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monthly Budget ($)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.budget}
                onChangeText={(text) => updateFormData('budget', text)}
                placeholder="Enter monthly budget"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={formData.bio}
                onChangeText={(text) => updateFormData('bio', text)}
                placeholder="Tell others about yourself..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {formData.bio.length}/500
              </Text>
            </View>
          </View>

          {/* User Type Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Type</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  formData.userType === 'seeker' && styles.userTypeOptionActive
                ]}
                onPress={() => updateFormData('userType', 'seeker')}
              >
                <Text style={styles.userTypeEmoji}>🏠</Text>
                <Text style={[
                  styles.userTypeText,
                  formData.userType === 'seeker' && styles.userTypeTextActive
                ]}>
                  Looking for Place
                </Text>
                <Text style={styles.userTypeDescription}>
                  I need somewhere to live
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeOption,
                  formData.userType === 'provider' && styles.userTypeOptionActive
                ]}
                onPress={() => updateFormData('userType', 'provider')}
              >
                <Text style={styles.userTypeEmoji}>👥</Text>
                <Text style={[
                  styles.userTypeText,
                  formData.userType === 'provider' && styles.userTypeTextActive
                ]}>
                  Has Place
                </Text>
                <Text style={styles.userTypeDescription}>
                  I have a place to share
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingTitle}>Profile Visible</Text>
                <Text style={styles.settingSubtitle}>
                  Show your profile to other users
                </Text>
              </View>
              <Switch
                value={formData.profileVisible}
                onValueChange={(value) => updateFormData('profileVisible', value)}
                trackColor={{ false: '#E5E7EB', true: '#44C76F' }}
                thumbColor={formData.profileVisible ? '#004D40' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F5F1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#44C76F',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#004D40',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveButtonText: {
    color: '#004D40',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#004D40',
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#44C76F',
  },
  changePhotoButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004D40',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  userTypeContainer: {
    gap: 12,
  },
  userTypeOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  userTypeOptionActive: {
    backgroundColor: 'rgba(68, 199, 111, 0.1)',
    borderColor: '#44C76F',
  },
  userTypeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6B7280',
    marginBottom: 4,
  },
  userTypeTextActive: {
    color: '#004D40',
  },
  userTypeDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004D40',
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  bottomSpacing: {
    height: 20,
  },
});