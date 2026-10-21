import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null; // Текущий пользователь
  session: Session | null; // Текущая сессия (JWT)
  loading: boolean; // Идет ли загрузка
  signUp: (email: string, password: string) => Promise<{ error: string | null }>; // Регистрация
  signIn: (email: string, password: string) => Promise<{ error: string | null }>; // Вход
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); // Создаем контекст
