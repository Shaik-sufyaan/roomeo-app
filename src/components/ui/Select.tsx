// components/ui/Select.tsx - Mobile-native picker/dropdown component
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { cn } from '../../lib/utils';

const { width } = Dimensions.get('window');

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  error?: boolean;
  errorMessage?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = 'Select an option...',
  onValueChange,
  disabled = false,
  style,
  textStyle,
  variant = 'outline',
  size = 'default',
  error = false,
  errorMessage,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleOptionPress = (optionValue: string) => {
    onValueChange(optionValue);
    setModalVisible(false);
  };

  const triggerStyles = [
    styles.trigger,
    styles[`trigger${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`triggerSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.triggerDisabled,
    error && styles.triggerError,
    style,
  ];

  const triggerTextStyles = [
    styles.triggerText,
    styles[`triggerTextSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    disabled && styles.triggerTextDisabled,
    !selectedOption && styles.placeholderText,
    textStyle,
  ];

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={[
        styles.option,
        item.disabled && styles.optionDisabled,
        item.value === value && styles.optionSelected,
      ]}
      onPress={() => !item.disabled && handleOptionPress(item.value)}
      disabled={item.disabled}
    >
      <Text
        style={[
          styles.optionText,
          item.disabled && styles.optionTextDisabled,
          item.value === value && styles.optionTextSelected,
        ]}
      >
        {item.label}
      </Text>
      {item.value === value && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        style={cn(...triggerStyles)}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={cn(...triggerTextStyles)}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={[styles.chevron, disabled && styles.chevronDisabled]}>
          ▼
        </Text>
      </TouchableOpacity>

      {error && errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Trigger styles
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },

  // Trigger variants
  triggerDefault: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  triggerOutline: {
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
  },
  triggerGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Trigger sizes
  triggerSizeSm: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  triggerSizeDefault: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  triggerSizeLg: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Trigger states
  triggerDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  triggerError: {
    borderColor: '#EF4444',
  },

  // Trigger text styles
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  triggerTextSizeSm: {
    fontSize: 14,
  },
  triggerTextSizeDefault: {
    fontSize: 16,
  },
  triggerTextSizeLg: {
    fontSize: 18,
  },
  triggerTextDisabled: {
    color: '#9CA3AF',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontWeight: '400',
  },

  // Chevron
  chevron: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  chevronDisabled: {
    color: '#D1D5DB',
  },

  // Error text
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: width - 40,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Options list
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionSelected: {
    backgroundColor: '#F0FDF4',
  },
  optionDisabled: {
    backgroundColor: '#F9FAFB',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#044317',
    fontWeight: '600',
  },
  optionTextDisabled: {
    color: '#9CA3AF',
  },
  checkmark: {
    fontSize: 16,
    color: '#44C76F',
    fontWeight: '700',
  },
});

// Export default for convenience
export default Select;