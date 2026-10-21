import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext, type AuthContextType } from './AuthContext';
import type { User, Session } from '@supabase/supabase-js';

// Провайдер - оборачивает все приложение
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Состояние -  пользователь
  const [session, setSession] = useState<Session | null>(null); // Состояние - сессия
  const [loading, setLoading] = useState(true); // Состояние загрузка(true - пока проверяем сессию при старте)

  // useEffect - при монтировании проверка сессии + подписка на изменения
  useEffect(() => {
    // Получаем текущию сессию если есть
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session); // сохраняем сессию
        setUser(session?.user ?? null); // сохраняем пользователя или (null)
        setLoading(false); // загрузка завершина
      })
      .catch(() => setLoading(false));

    // Подписка на изменения auth(вход/выход/обновление токена)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); // обновление сессии
      setUser(session?.user ?? null); // обновление пользователя
    });
    return () => subscription.unsubscribe(); // отписка при размонтировании
  }, []);

  // функция регистрации
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password }); // запрос в supabase
    return { error: error?.message ?? null }; // возврат монтировании или null
  };

  // функция входа
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  // функция выхода
  const signOut = async () => {
    await supabase.auth.signOut(); // разлогирование
    // состояние user / session обновится автоматом через onAuthStateChange
  };

  // значение контекста
  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
