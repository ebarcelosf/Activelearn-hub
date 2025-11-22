import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Only synchronous state updates here
        setSession(session);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.email!);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // If we already have a session on load, fetch the profile immediately
        fetchUserProfile(session.user.id, session.user.email!);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separate function to fetch user profile
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let finalProfile = profile;

      // Auto-provision profile if missing
      if (!finalProfile) {
        const defaultName = email.split('@')[0];
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, name: defaultName })
          .select()
          .single();
        if (insertError) throw insertError;
        finalProfile = inserted;
      }
      
      setUser({
        id: finalProfile.id,
        name: finalProfile.name,
        email: email,
        avatar_url: finalProfile.avatar_url,
        xp: finalProfile.xp,
        level: finalProfile.level,
        created_at: finalProfile.created_at,
        updated_at: finalProfile.updated_at
      });
    } catch (err) {
      console.error('Erro ao buscar/criar perfil do usuário:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setError(error.message);
        return false;
      }

      return true;
    } catch (err) {
      setError('Erro inesperado durante o login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      if (credentials.password !== credentials.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: credentials.name,
          }
        }
      });

      if (error) {
        setError(error.message);
        return false;
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return true;
    } catch (err) {
      setError('Erro inesperado durante o registro');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: { name?: string }): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        setError(error.message);
        return false;
      }

      setUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      setError('Erro ao atualizar perfil');
      return false;
    }
  };

  const updatePassword = async (data: UpdatePasswordData): Promise<boolean> => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        setError(error.message);
        return false;
      }

      return true;
    } catch (err) {
      setError('Erro ao atualizar senha');
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      // Chamar a edge function para enviar senha temporária
      const { data, error } = await supabase.functions.invoke('send-temporary-password', {
        body: { email }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        setError('Erro ao processar solicitação');
        return false;
      }

      if (data?.error) {
        setError(data.error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro ao enviar senha temporária:', err);
      setError('Erro ao enviar senha temporária');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (password: string): Promise<boolean> => {
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password,
      });

      if (signInError) {
        setError('Senha incorreta');
        return false;
      }

      // Delete user profile (cascades to related data)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (deleteError) {
        setError('Erro ao deletar conta');
        return false;
      }

      await logout();
      return true;
    } catch (err) {
      setError('Erro ao deletar conta');
      return false;
    }
  };

  const updateSettings = async (settings: any): Promise<boolean> => {
    // For now, just return true as settings are handled by theme provider
    return true;
  };

  const clearError = () => setError(null);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    resetPassword,
    deleteAccount,
    updateSettings,
    clearError
  };
};