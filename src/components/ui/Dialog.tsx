// components/ui/Dialog.tsx - Mobile-native modal dialog component
import React, { createContext, useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { cn } from '../../lib/utils';

const { width, height } = Dimensions.get('window');

// Context for managing dialog state
interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog provider');
  }
  return context;
};

// Main Dialog container
export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isOpen = open !== undefined ? open : internalOpen;

  const setOpen = (newOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider
      value={{
        open: isOpen,
        setOpen,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

// Dialog Trigger
export interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  style?: ViewStyle;
}

export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  asChild = false,
  style,
}) => {
  const { setOpen } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onPress: () => {
        setOpen(true);
        children.props.onPress?.();
      },
    });
  }

  return (
    <TouchableOpacity style={style} onPress={() => setOpen(true)}>
      {children}
    </TouchableOpacity>
  );
};

// Dialog Content (Modal)
export interface DialogContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  closable?: boolean;
  overlayStyle?: ViewStyle;
}

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  style,
  size = 'default',
  position = 'center',
  closable = true,
  overlayStyle,
}) => {
  const { open, setOpen } = useDialogContext();

  const contentStyles = [
    styles.dialogContent,
    styles[`dialogContentSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
    styles[`dialogContentPosition${position.charAt(0).toUpperCase() + position.slice(1)}`],
    style,
  ];

  const overlayStyles = [
    styles.dialogOverlay,
    styles[`dialogOverlayPosition${position.charAt(0).toUpperCase() + position.slice(1)}`],
    overlayStyle,
  ];

  return (
    <Modal
      visible={open}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={() => closable && setOpen(false)}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={cn(...overlayStyles)}
          activeOpacity={1}
          onPress={() => closable && setOpen(false)}
        >
          <TouchableOpacity
            style={cn(...contentStyles)}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {children}
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Dialog Header
export interface DialogHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children, style }) => {
  return (
    <View style={[styles.dialogHeader, style]}>
      {children}
    </View>
  );
};

// Dialog Title
export interface DialogTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, style }) => {
  return (
    <Text style={[styles.dialogTitle, style]}>
      {children}
    </Text>
  );
};

// Dialog Description
export interface DialogDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, style }) => {
  return (
    <Text style={[styles.dialogDescription, style]}>
      {children}
    </Text>
  );
};

// Dialog Body
export interface DialogBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
}

export const DialogBody: React.FC<DialogBodyProps> = ({
  children,
  style,
  scrollable = false
}) => {
  if (scrollable) {
    return (
      <ScrollView
        style={[styles.dialogBody, style]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.dialogBody, style]}>
      {children}
    </View>
  );
};

// Dialog Footer
export interface DialogFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, style }) => {
  return (
    <View style={[styles.dialogFooter, style]}>
      {children}
    </View>
  );
};

// Dialog Close Button
export interface DialogCloseProps {
  children: React.ReactNode;
  asChild?: boolean;
  style?: ViewStyle;
}

export const DialogClose: React.FC<DialogCloseProps> = ({
  children,
  asChild = false,
  style,
}) => {
  const { setOpen } = useDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onPress: () => {
        setOpen(false);
        children.props.onPress?.();
      },
    });
  }

  return (
    <TouchableOpacity style={style} onPress={() => setOpen(false)}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },

  // Overlay styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogOverlayPositionCenter: {
    justifyContent: 'center',
  },
  dialogOverlayPositionTop: {
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  dialogOverlayPositionBottom: {
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },

  // Content base styles
  dialogContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
    maxHeight: height * 0.8,
  },

  // Content sizes
  dialogContentSizeSm: {
    width: Math.min(width - 80, 320),
  },
  dialogContentSizeDefault: {
    width: Math.min(width - 40, 480),
  },
  dialogContentSizeLg: {
    width: Math.min(width - 20, 640),
  },
  dialogContentSizeXl: {
    width: width - 20,
  },
  dialogContentSizeFull: {
    width: width,
    height: height,
    borderRadius: 0,
  },

  // Content positions
  dialogContentPositionCenter: {
    // Default positioning handled by overlay
  },
  dialogContentPositionTop: {
    // Default positioning handled by overlay
  },
  dialogContentPositionBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: width,
  },

  // Header styles
  dialogHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  // Title styles
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 8,
    lineHeight: 24,
  },

  // Description styles
  dialogDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 20,
  },

  // Body styles
  dialogBody: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    flex: 1,
  },

  // Footer styles
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
});

// Export all components as named exports
export { Dialog as default };

// Compound component pattern
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;
Dialog.Close = DialogClose;