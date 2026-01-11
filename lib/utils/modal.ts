/**
 * Utility hook for showing modals
 * This provides a simple way to show modals throughout the app
 */

import { useState, useCallback } from 'react';

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'error' | 'success' | 'info' | 'warning';
}

export function useModal() {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = useCallback(
    (title: string, message: string, type: ModalState['type'] = 'info') => {
      setModal({
        isOpen: true,
        title,
        message,
        type,
      });
    },
    []
  );

  const showError = useCallback((title: string, message: string) => {
    showModal(title, message, 'error');
  }, [showModal]);

  const showSuccess = useCallback((title: string, message: string) => {
    showModal(title, message, 'success');
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string) => {
    showModal(title, message, 'warning');
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string) => {
    showModal(title, message, 'info');
  }, [showModal]);

  const closeModal = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modal,
    showModal,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    closeModal,
  };
}
