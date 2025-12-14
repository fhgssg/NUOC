import React, { ReactNode } from 'react';
import Modal, { ModalProps } from 'react-native-modal';

interface SafeModalProps extends ModalProps {
  children: ReactNode;
}

/**
 * SafeModal - Wrapper cho react-native-modal để xử lý lỗi BackHandler.removeEventListener
 * Lỗi này xảy ra do react-native-modal cố gọi removeEventListener
 * nhưng method này không tồn tại trong React Native mới (chỉ có subscription.remove())
 * 
 * Component này đơn giản chỉ wrap Modal và để patch BackHandler trong app/_layout.tsx xử lý
 */
const SafeModal: React.FC<SafeModalProps> = ({ children, ...modalProps }) => {
  return (
    <Modal {...modalProps}>
      {children}
    </Modal>
  );
};

export default SafeModal;

