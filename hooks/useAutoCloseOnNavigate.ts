import { useEffect } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

export function useAutoCloseOnNavigate(
  id: string,
  isOpen: boolean,
  onClose: () => void
) {
  const { registerModal, unregisterModal } = useNavigation();
  
  useEffect(() => {
    if (isOpen) {
      registerModal(id, onClose);
    } else {
      unregisterModal(id);
    }
    
    return () => {
      unregisterModal(id);
    };
  }, [isOpen, id, onClose, registerModal, unregisterModal]);
}
