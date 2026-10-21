import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('Параметр useAuth необходимо использовать внутри AuthProvider');
  return ctx;
};
